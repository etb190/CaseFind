#!/usr/bin/env python3
"""
CaseFind Federal Cases Ingestion Script
Streams CourtListener bulk data archives and populates SQLite (cases.db).
"""

import os
import sys
import csv
import json
import time
import html
import re
import sqlite3
import subprocess
import argparse

csv.field_size_limit(sys.maxsize)

BULK_BASE = "https://com-courtlistener-storage.s3-us-west-2.amazonaws.com/bulk-data/"
DEFAULT_DATE = "2026-09-30"
DB_PATH = os.environ.get("DB_PATH", os.path.expanduser("~/cases.db"))
MIN_CHARS = 1000

# Federal court identifiers
FEDERAL_APPELLATE = {
    "scotus", "ca1", "ca2", "ca3", "ca4", "ca5", "ca6", "ca7",
    "ca8", "ca9", "ca10", "ca11", "cadc", "cafc"
}

def ensure_lbzip2():
    try:
        subprocess.run(["which", "lbzip2"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except Exception:
        print("[setup] Installing lbzip2 for fast multi-threaded decompression...")
        subprocess.run("sudo apt-get update -qq && sudo apt-get install -y -qq lbzip2", shell=True)

def init_db(db_path, clear=False):
    if clear and os.path.exists(db_path):
        print(f"[database] Removing previous database at {db_path}...")
        os.remove(db_path)

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        name TEXT,
        case_name_full TEXT,
        court TEXT,
        court_type TEXT,
        jurisdiction TEXT,
        date_filed TEXT,
        citations TEXT,
        citation_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Precedential',
        text TEXT
    )
    """)

    cur.execute("CREATE INDEX IF NOT EXISTS idx_cases_court ON cases(court)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_cases_date ON cases(date_filed)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_cases_court_type ON cases(court_type)")
    conn.commit()
    conn.close()
    print(f"[database] Schema initialized at {db_path}")

def stream_csv(name, date_str):
    url = f"{BULK_BASE}{name}-{date_str}.csv.bz2"
    print(f"[download] Streaming {url} ...", flush=True)
    fetcher = os.environ.get("FETCHER", "curl")
    if fetcher == "parallel":
        pfetch = os.environ.get("PFETCH_PATH", "pfetch.py")
        conns = os.environ.get("PARALLEL_CONNS", "16")
        chunk_mb = os.environ.get("PARALLEL_CHUNK_MB", "8")
        cmd = f'python3 "{pfetch}" "{url}" {chunk_mb} {conns} | lbzip2 -dc'
    else:
        cmd = f"curl -sL {url} | lbzip2 -dc"
    p = subprocess.Popen(
        cmd,
        shell=True,
        stdout=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace",
        bufsize=4 * 1024 * 1024
    )
    rd = csv.DictReader(p.stdout, escapechar="\\", doublequote=False)
    return rd, p

def clean_text(raw_row):
    t = raw_row.get("plain_text") or ""
    if not t.strip():
        html_content = (
            raw_row.get("html_with_citations") or
            raw_row.get("html_lawbox") or
            raw_row.get("html") or
            raw_row.get("xml_harvard") or ""
        )
        t = html.unescape(re.sub(r"<[^>]+>", " ", html_content))
    return re.sub(r"\s+", " ", t).strip()

def map_court_category(court_id, jurisdiction="F"):
    cid = (court_id or "").lower()
    if cid == "scotus":
        return "SCOTUS"
    if cid in FEDERAL_APPELLATE or jurisdiction == "F":
        return "F"
    elif "bankr" in cid or "bap" in cid or jurisdiction == "FB":
        return "FB"
    elif any(k in cid for k in ["claim", "trade", "tax"]) or jurisdiction == "FS":
        return "FS"
    return "FD"

def is_bankruptcy_court(court_id, jurisdiction=""):
    """Bankruptcy courts (and BAPs) - CourtListener jurisdiction 'FB' or id patterns."""
    cid = (court_id or "").lower()
    return jurisdiction == "FB" or "bankr" in cid or "bap" in cid or (len(cid) >= 3 and cid.endswith("b") and cid not in ("scotus", "cabc"))

def run_ingest(date_str=DEFAULT_DATE, target_count=None, clear=True, include_districts=True, include_bankruptcy=False, court_filter=None):
    ensure_lbzip2()
    init_db(DB_PATH, clear=clear)

    t0 = time.time()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    clusters = {}

    # Check cached cluster scan to skip dockets & clusters scans.
    # Court-specific runs prefer their own cache file and may fall back to the
    # unfiltered clus.pkl (filtered in memory). Filtered scans never write to
    # clus.pkl, so a partial cache can never masquerade as the full federal set.
    cache_file = "clus.pkl" if not court_filter else f"clus.{court_filter}.pkl"
    cache_candidates = [cache_file] if not court_filter else [cache_file, "clus.pkl"]
    for cache_path in cache_candidates:
        if not os.path.exists(cache_path):
            continue
        try:
            import pickle
            with open(cache_path, "rb") as f:
                cached = pickle.load(f)
            # New format: {"_dump_date": ..., "clusters": {id: (court, name, date, ...)}}
            # Legacy format: plain {id: tuple} - ignored (cannot validate dump date)
            if isinstance(cached, dict) and cached.get("_dump_date") == date_str:
                rows = cached.get("clusters", {})
                for k, v in rows.items():
                    if isinstance(v, (list, tuple)) and len(v) >= 3:
                        if court_filter and str(v[0]).lower() != court_filter:
                            continue
                        clusters[str(k)] = {
                            "court": v[0],
                            "case_name": v[1],
                            "date_filed": v[2],
                            "citations": "[]",
                            "citation_count": 0
                        }
                label = f" [court filter: {court_filter}]" if court_filter else ""
                print(f"[clusters] Loaded {len(clusters):,} clusters from {cache_path}, dump {date_str}{label} (skipped scan!)")
                break
            else:
                print(f"[clusters] {cache_path} ignored (stale/legacy format or different dump date) - rescanning")
        except Exception as e:
            print(f"[clusters] Note on {cache_path} cache: {e}")

    if not clusters:
        # 1. Courts
        rd, p = stream_csv("courts", date_str)
        federal_courts = {}
        skipped_bankruptcy = 0
        for r in rd:
            juris = r.get("jurisdiction", "")
            cid = r.get("id", "")
            if court_filter and cid != court_filter:
                continue
            if cid in FEDERAL_APPELLATE or juris in ("F", "FD", "FB", "FS"):
                # Exclude bankruptcy courts entirely unless explicitly requested
                if not include_bankruptcy and is_bankruptcy_court(cid, juris):
                    skipped_bankruptcy += 1
                    continue
                if not include_districts and juris not in ("F",):
                    continue
                federal_courts[cid] = (cid, juris)
        p.kill()
        print(f"[courts] Loaded {len(federal_courts):,} qualifying federal courts in {time.time()-t0:.1f}s" + (f" (excluded {skipped_bankruptcy:,} bankruptcy courts)" if skipped_bankruptcy else ""))

        # 2. Dockets
        t_dock = time.time()
        rd, p = stream_csv("dockets", date_str)
        federal_dockets = {}
        for i, r in enumerate(rd):
            court_id = r.get("court_id", "")
            if court_filter and court_id != court_filter:
                continue
            if court_id in federal_courts:
                federal_dockets[r["id"]] = court_id
            if i > 0 and i % 2_000_000 == 0:
                print(f"  [dockets] scanned {i:,} | federal matches: {len(federal_dockets):,} ({time.time()-t_dock:.0f}s)", flush=True)
        p.kill()
        print(f"[dockets] Found {len(federal_dockets):,} federal dockets in {time.time()-t_dock:.1f}s")

        # 3. Opinion Clusters (case names, dates, citations)
        t_clus = time.time()
        rd, p = stream_csv("opinion-clusters", date_str)
        for i, r in enumerate(rd):
            doc_id = r.get("docket_id", "")
            if doc_id in federal_dockets:
                clusters[r["id"]] = {
                    "court": federal_dockets[doc_id],
                    "case_name": r.get("case_name", "Unknown Case"),
                    "date_filed": r.get("date_filed", ""),
                    "citations": r.get("citations", "[]"),
                    "citation_count": int(r.get("citation_count", 0) or 0)
                }
            if i > 0 and i % 1_000_000 == 0:
                print(f"  [clusters] scanned {i:,} | federal clusters: {len(clusters):,} ({time.time()-t_clus:.0f}s)", flush=True)
        p.kill()
        print(f"[clusters] Found {len(clusters):,} federal case clusters in {time.time()-t_clus:.1f}s")

        # Cache clusters so re-runs (e.g. --court filters, resume) skip the dockets+clusters scans.
        # NOTE: saved under the filter-specific name - a --court run never overwrites clus.pkl.
        try:
            import pickle
            with open(cache_file, "wb") as f:
                pickle.dump({"_dump_date": date_str, "clusters": clusters}, f, protocol=pickle.HIGHEST_PROTOCOL)
            scope = "full federal" if not court_filter else f"court={court_filter}"
            print(f"[clusters] Cached {len(clusters):,} clusters ({scope}) to {cache_file} (dump {date_str})")
        except Exception as e:
            print(f"[clusters] Could not cache clusters: {e}")

    # 4. Stream Opinions and insert into SQLite
    t_ops = time.time()
    rd, p = stream_csv("opinions", date_str)

    batch = []
    saved_count = 0
    BATCH_SIZE = 2000

    print(f"[opinions] Ingesting opinions into SQLite ({DB_PATH})...", flush=True)

    for i, r in enumerate(rd):
        clus_id = r.get("cluster_id")
        if clus_id in clusters:
            text = clean_text(r)
            if len(text) >= MIN_CHARS:
                c_info = clusters[clus_id]
                c_type = map_court_category(c_info["court"])
                case_id = r.get("id") or str(clus_id)

                batch.append((
                    str(case_id),
                    c_info["case_name"],
                    c_info["case_name"],
                    c_info["court"],
                    c_type,
                    "US Federal",
                    str(c_info["date_filed"])[:10],
                    str(c_info["citations"]),
                    c_info["citation_count"],
                    "Precedential",
                    text
                ))

                if len(batch) >= BATCH_SIZE:
                    cur.executemany("""
                    INSERT OR REPLACE INTO cases (
                        id, name, case_name_full, court, court_type,
                        jurisdiction, date_filed, citations, citation_count, status, text
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, batch)
                    conn.commit()
                    saved_count += len(batch)
                    batch = []

                    rate = saved_count / max(1, (time.time() - t_ops))
                    print(f"  [saved] {saved_count:,} cases saved | scanned {i:,} rows ({rate:.0f} cases/s)", flush=True)

                    if target_count and saved_count >= target_count:
                        print(f"[target] Reached requested limit of {target_count:,} cases.")
                        break

        if i > 0 and i % 50_000 == 0 and len(batch) == 0:
            print(f"  [opinions scan] {i:,} rows scanned | {saved_count:,} federal cases retained", flush=True)

    if batch:
        cur.executemany("""
        INSERT OR REPLACE INTO cases (
            id, name, case_name_full, court, court_type,
            jurisdiction, date_filed, citations, citation_count, status, text
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, batch)
        conn.commit()
        saved_count += len(batch)

    p.kill()

    # 5. Build SQLite FTS5 Full-Text Search Table for fast searching
    print("\n[search] Building SQLite FTS5 full-text search index for sub-millisecond search...")
    try:
        cur.execute("CREATE VIRTUAL TABLE IF NOT EXISTS cases_fts USING fts5(id, name, court, text, content='cases', content_rowid='rowid')")
        cur.execute("INSERT INTO cases_fts(cases_fts) VALUES('rebuild')")
        conn.commit()
        print("[search] FTS5 full-text index built successfully.")
    except Exception as e:
        print(f"[search] Note: FTS5 indexing skipped: {e}")

    conn.close()

    total_time = (time.time() - t0) / 60
    db_size_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    print("\n" + "=" * 60)
    print(f"  COMPLETE: {saved_count:,} federal cases ingested")
    print(f"  Database size: {db_size_mb:.1f} MB ({DB_PATH})")
    print(f"  Total time: {total_time:.1f} minutes")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest federal cases into CaseFind SQLite database")
    parser.add_argument("--limit", type=int, default=None, help="Stop after N cases (omit to ingest all)")
    parser.add_argument("--date", type=str, default=DEFAULT_DATE, help="CourtListener dump date (YYYY-MM-DD)")
    parser.add_argument("--keep-existing", action="store_true", help="Append without clearing previous DB")
    parser.add_argument("--appeals-only", action="store_true", help="Ingest only Supreme Court and Circuit Appeals")
    parser.add_argument("--include-bankruptcy", action="store_true", help="Also ingest bankruptcy courts (excluded by default)")
    parser.add_argument("--court", type=str, default=None, help="Restrict ingestion to one court id (e.g. scotus, ca9, nyed)")
    args = parser.parse_args()

    run_ingest(
        date_str=args.date,
        target_count=args.limit,
        clear=not args.keep_existing,
        include_districts=not args.appeals_only,
        include_bankruptcy=args.include_bankruptcy,
        court_filter=(args.court.lower() if args.court else None)
    )
