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

csv.field_size_limit(min(sys.maxsize, 2**31 - 1))

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

    cur.execute("PRAGMA journal_mode=WAL")
    cur.execute("PRAGMA busy_timeout=30000")
    cur.execute("PRAGMA synchronous=NORMAL")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_cases_court ON cases(court)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_cases_date ON cases(date_filed)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_cases_court_type ON cases(court_type)")
    conn.commit()
    conn.close()
    print(f"[database] Schema initialized at {db_path} (WAL mode enabled)")

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
    """Opinion text with real paragraph breaks preserved.

    plain_text keeps newlines; every newline run becomes a paragraph break
    (blank line). Spaces/tabs within a line are collapsed. When only HTML is
    available, block-level tags are turned into paragraph breaks before the
    remaining markup is stripped to spaces."""
    t = raw_row.get("plain_text") or ""
    if not t.strip():
        html_content = (
            raw_row.get("html_with_citations") or
            raw_row.get("html_lawbox") or
            raw_row.get("html") or
            raw_row.get("xml_harvard") or ""
        )
        t = re.sub(
            r"<\s*/?\s*(p|div|br|h[1-6]|blockquote|li|tr|section|article|fn|footnote)[^>]*>",
            "\n\n", html_content, flags=re.IGNORECASE)
        t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    t = t.replace("\r\n", "\n").replace("\r", "\n")
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r" *\n+ *", "\n\n", t)
    return re.sub(r"\n{3,}", "\n\n", t).strip()

def map_court_category(court_id, jurisdiction=""):
    cid = (court_id or "").lower()
    if cid == "scotus":
        return "SCOTUS"
    if cid in FEDERAL_APPELLATE:
        return "F"
    elif "bankr" in cid or "bap" in cid or jurisdiction == "FB":
        return "FB"
    elif any(k in cid for k in ["claim", "trade", "tax", "cit", "armfor", "cavc"]) or jurisdiction == "FS":
        return "FS"
    return "FD"

def is_bankruptcy_court(court_id, jurisdiction=""):
    """Bankruptcy courts (and BAPs) - CourtListener jurisdiction 'FB' or id patterns."""
    cid = (court_id or "").lower()
    return jurisdiction == "FB" or "bankr" in cid or "bap" in cid or (len(cid) >= 3 and cid.endswith("b") and cid not in ("scotus", "cabc"))

def run_ingest(date_str=DEFAULT_DATE, target_count=None, clear=True, include_districts=True, include_bankruptcy=False, court_filter=None, resume=False):
    ensure_lbzip2()
    
    # If resuming, do not clear the database
    if resume:
        clear = False

    init_db(DB_PATH, clear=clear)

    t0 = time.time()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    existing_ids = set()
    if resume or not clear:
        try:
            existing_ids = set(r[0] for r in cur.execute("SELECT id FROM cases").fetchall())
            if existing_ids:
                print(f"[resume] Found {len(existing_ids):,} cases already in {DB_PATH} - will skip duplicates and append.")
        except Exception as e:
            print(f"[resume] Note on existing cases check: {e}")

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
                    if isinstance(v, dict):
                        court = v.get("court", "")
                        if court_filter and str(court).lower() != court_filter:
                            continue
                        clusters[str(k)] = v
                    elif isinstance(v, (list, tuple)) and len(v) >= 3:
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
    skipped_existing = 0
    BATCH_SIZE = 2000

    print(f"[opinions] Ingesting opinions into SQLite ({DB_PATH})...", flush=True)

    for i, r in enumerate(rd):
        clus_id = r.get("cluster_id")
        if clus_id in clusters:
            case_id = str(r.get("id") or clus_id)
            if case_id in existing_ids:
                skipped_existing += 1
                if i > 0 and i % 50_000 == 0 and len(batch) == 0:
                    print(f"  [opinions scan] {i:,} rows scanned | {skipped_existing:,} skipped (already in DB) | {saved_count:,} new cases retained", flush=True)
                continue

            text = clean_text(r)
            if len(text) >= MIN_CHARS:
                c_info = clusters[clus_id]
                c_type = map_court_category(c_info["court"])

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
                    print(f"  [saved] {saved_count:,} new cases saved | scanned {i:,} rows ({rate:.0f} cases/s)", flush=True)

                    if target_count and saved_count >= target_count:
                        print(f"[target] Reached requested limit of {target_count:,} cases.")
                        break

        if i > 0 and i % 50_000 == 0 and len(batch) == 0:
            print(f"  [opinions scan] {i:,} rows scanned | {skipped_existing:,} skipped (already in DB) | {saved_count:,} new cases retained", flush=True)

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
    build_fts(DB_PATH)
    ensure_indexes(DB_PATH)

    conn.close()

    total_time = (time.time() - t0) / 60
    db_size_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    print("\n" + "=" * 60)
    print(f"  COMPLETE: {saved_count:,} new federal cases ingested ({len(existing_ids) + saved_count:,} total)")
    print(f"  Database size: {db_size_mb:.1f} MB ({DB_PATH})")
    print(f"  Total time: {total_time:.1f} minutes")
    print("=" * 60 + "\n")

def build_fts(db_path=DB_PATH):
    """Build both search indexes: the full opinion-text FTS index and the
    small name/citation index used for fast title and citation searches."""
    _build_main_fts(db_path)
    build_names_fts(db_path)

def _build_main_fts(db_path=DB_PATH):
    print(f"\n[search] Building SQLite FTS5 full-text search index in {db_path}...")
    t0 = time.time()
    try:
        conn = sqlite3.connect(db_path, timeout=300)
        cur = conn.cursor()
        cur.execute("PRAGMA journal_mode=WAL")
        cur.execute("PRAGMA busy_timeout=300000")
        cur.execute("PRAGMA synchronous=NORMAL")
        # Keep the -wal file small: a single giant 'rebuild' transaction would
        # pile the whole multi-GB index into the WAL before committing.
        cur.execute("PRAGMA wal_autocheckpoint=1000")

        # Older FTS tables lack the citations column; recreate the table so
        # citation searches run on the index instead of a full table scan.
        existing = cur.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='cases_fts'"
        ).fetchone()
        if existing:
            fts_cols = [r[1] for r in cur.execute("PRAGMA table_info(cases_fts)").fetchall()]
            if "citations" not in fts_cols:
                print("[search] Existing FTS index predates the citations column - recreating table...")
                cur.execute("DROP TABLE cases_fts")
                existing = None
        if not existing:
            cur.execute("CREATE VIRTUAL TABLE cases_fts USING fts5("
                        "id, name, court, text, citations, content='cases', content_rowid='rowid')")
            conn.commit()
        else:
            # Right shape already: skip entirely if a previous run completed.
            try:
                indexed = cur.execute("SELECT COUNT(*) FROM cases_fts_docsize").fetchone()[0]
            except sqlite3.OperationalError:
                indexed = -1
            total_now = cur.execute("SELECT COUNT(*) FROM cases").fetchone()[0]
            if indexed == total_now:
                print(f"[search] FTS index already complete ({total_now:,} cases) - nothing to do.")
                conn.close()
                return
            if indexed >= 0:
                print(f"[search] Incomplete index ({indexed:,}/{total_now:,}) - rebuilding from scratch...")

        cur.execute("INSERT INTO cases_fts(cases_fts) VALUES('delete-all')")
        conn.commit()
        total = cur.execute("SELECT COUNT(*) FROM cases").fetchone()[0]
        if not total:
            conn.close()
            print("[search] Empty database - nothing to index.")
            return
        lo = cur.execute("SELECT MIN(rowid) FROM cases").fetchone()[0] or 1
        hi = cur.execute("SELECT MAX(rowid) FROM cases").fetchone()[0] or 0
        BATCH = 25_000
        done = 0
        start = lo
        print(f"[search] Indexing {total:,} cases in batches of {BATCH:,} "
              f"(progress printed every batch)...", flush=True)
        while start <= hi:
            end = min(start + BATCH - 1, hi)
            cur.execute(
                "INSERT INTO cases_fts(rowid, id, name, court, text, citations) "
                "SELECT rowid, id, name, court, text, citations FROM cases "
                "WHERE rowid BETWEEN ? AND ?", (start, end))
            done += cur.rowcount or 0
            conn.commit()
            rate = done / max(1e-9, time.time() - t0)
            eta = (total - done) / rate / 60 if rate > 1 else 0
            eta_s = f", ~{eta:.0f} min left" if eta >= 1 else ""
            print(f"  [fts] {done:,}/{total:,} cases indexed "
                  f"({rate:,.0f}/s{eta_s})", flush=True)
            start = end + 1
        conn.close()
        print(f"[search] FTS5 index built successfully in {(time.time()-t0)/60:.1f} min "
              f"({total:,} cases, citations included).")
    except Exception as e:
        print(f"[search] FTS5 indexing error: {e}")
        print("[search] The index may be incomplete - simply re-run this command; "
              "it starts a clean rebuild.", flush=True)

def build_names_fts(db_path=DB_PATH):
    """Small FTS5 index over just (id, name, citations).

    In the full index, a common word like 'president' carries postings from
    every opinion whose TEXT mentions it - millions of entries - so an
    11-word case-name AND query decodes giant doclists even though it only
    matches a handful of names. This index carries only name/citation
    postings (~100x smaller), making title and citation searches index-only.
    Completeness-checked and resumable: re-runs only top up missing rows."""
    print(f"\n[search] Ensuring name/citation index (cases_names_fts) in {db_path}...")
    t0 = time.time()
    try:
        conn = sqlite3.connect(db_path, timeout=300)
        cur = conn.cursor()
        cur.execute("PRAGMA journal_mode=WAL")
        cur.execute("PRAGMA busy_timeout=300000")
        cur.execute("PRAGMA synchronous=NORMAL")
        cur.execute("PRAGMA wal_autocheckpoint=1000")
        cur.execute("CREATE VIRTUAL TABLE IF NOT EXISTS cases_names_fts USING fts5("
                    "id, name, citations, content='cases', content_rowid='rowid')")
        conn.commit()
        try:
            indexed = cur.execute("SELECT COUNT(*) FROM cases_names_fts_docsize").fetchone()[0]
        except sqlite3.OperationalError:
            indexed = -1
        total = cur.execute("SELECT COUNT(*) FROM cases").fetchone()[0]
        if indexed == total and total > 0:
            print(f"[search] Name/citation index already complete ({total:,} cases).")
            conn.close()
            return
        lo = cur.execute("SELECT MIN(rowid) FROM cases").fetchone()[0] or 1
        hi = cur.execute("SELECT MAX(rowid) FROM cases").fetchone()[0] or 0
        start = lo
        if 0 < indexed <= total:
            # Resume from the highest indexed rowid (batches commit in order)
            try:
                start = (cur.execute("SELECT MAX(rowid) FROM cases_names_fts_docsize").fetchone()[0] or 0) + 1
                if start < lo:
                    start = lo
            except sqlite3.OperationalError:
                start = lo
        elif indexed > total:
            # More index entries than cases (rows removed without FTS
            # maintenance): the top-up resume cannot repair that - rebuild.
            print("[search] Index has stale entries - rebuilding from scratch...", flush=True)
            cur.execute("INSERT INTO cases_names_fts(cases_names_fts) VALUES('delete-all')")
            conn.commit()
            indexed = 0
        BATCH = 50_000
        done = max(indexed, 0)
        print(f"[search] Indexing names/citations for {total:,} cases "
              f"in batches of {BATCH:,}...", flush=True)
        while start <= hi:
            end = min(start + BATCH - 1, hi)
            cur.execute(
                "INSERT INTO cases_names_fts(rowid, id, name, citations) "
                "SELECT rowid, id, name, citations FROM cases "
                "WHERE rowid BETWEEN ? AND ?", (start, end))
            done += cur.rowcount or 0
            conn.commit()
            rate = done / max(1e-9, time.time() - t0)
            eta = (total - done) / rate / 60 if rate > 1 else 0
            eta_s = f", ~{eta:.0f} min left" if eta >= 1 else ""
            print(f"  [names-fts] {done:,}/{total:,} cases indexed "
                  f"({rate:,.0f}/s{eta_s})", flush=True)
            start = end + 1
        conn.close()
        print(f"[search] Name/citation index built in {(time.time()-t0)/60:.1f} min "
              f"({total:,} cases).")
    except Exception as e:
        print(f"[search] Name/citation index error: {e} - re-run to resume.", flush=True)

def purge_short_cases(db_path=DB_PATH, min_words=300, dry_run=False):
    """Delete cases whose opinion text has fewer than min_words words.

    Text is whitespace-normalized at ingest (single spaces), so
    words = spaces + 1 exactly. Batched with per-batch commits (bounded
    WAL) and progress output. FTS entries are removed surgically in the
    same transaction: cases_fts and cases_names_fts are external-content
    tables, so deleting rows from 'cases' alone would leave stale,
    unmatched postings behind. Run with the app stopped. Re-runs are
    safe (idempotent)."""
    tag = "[dry run] " if dry_run else ""
    print(f"\n[purge] {tag}Cases with fewer than {min_words} words in {db_path}...")
    t0 = time.time()
    conn = sqlite3.connect(db_path, timeout=300)
    cur = conn.cursor()
    cur.execute("PRAGMA journal_mode=WAL")
    cur.execute("PRAGMA busy_timeout=300000")
    cur.execute("PRAGMA synchronous=NORMAL")
    cur.execute("PRAGMA wal_autocheckpoint=1000")

    has_main_fts = bool(cur.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name='cases_fts'").fetchone())
    has_names_fts = bool(cur.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name='cases_names_fts'").fetchone())

    # words = whitespace separators + 1, works for both collapsed texts and
    # paragraph-restored ones (a paragraph break counts ~1 word extra);
    # NULL/empty text counts as 0 words.
    WORDS = ("COALESCE(LENGTH(text) - LENGTH(REPLACE(REPLACE(REPLACE(REPLACE(text, ' ', ''), "
             "CHAR(10), ''), CHAR(13), ''), CHAR(9), '')) + 1, 0)")

    if dry_run:
        rows = cur.execute(
            f"SELECT COALESCE(court_type, '(none)') as ct, COUNT(*) as n FROM cases "
            f"WHERE {WORDS} < ? GROUP BY ct ORDER BY n DESC", (min_words,)).fetchall()
        total = sum(r[1] for r in rows)
        print(f"[purge] Would delete {total:,} cases:")
        for ct, n in rows:
            print(f"    {ct}: {n:,}")
        print(f"[purge] Dry run complete in {time.time()-t0:.0f}s. Nothing was deleted.")
        conn.close()
        return

    total = cur.execute("SELECT COUNT(*) FROM cases").fetchone()[0]
    lo = cur.execute("SELECT MIN(rowid) FROM cases").fetchone()[0] or 1
    hi = cur.execute("SELECT MAX(rowid) FROM cases").fetchone()[0] or 0
    BATCH = 25_000
    start, deleted = lo, 0
    print(f"[purge] Scanning {total:,} cases in batches of {BATCH:,}...", flush=True)
    while start <= hi:
        end = min(start + BATCH - 1, hi)
        victims = cur.execute(
            f"SELECT rowid, id, name, court, text, citations FROM cases "
            f"WHERE rowid BETWEEN ? AND ? AND {WORDS} < ?",
            (start, end, min_words)).fetchall()
        if victims:
            if has_main_fts:
                cur.executemany(
                    "INSERT INTO cases_fts(cases_fts, rowid, id, name, court, text, citations) "
                    "VALUES('delete', ?, ?, ?, ?, ?, ?)",
                    [(v[0], v[1], v[2], v[3], v[4], v[5]) for v in victims])
            if has_names_fts:
                cur.executemany(
                    "INSERT INTO cases_names_fts(cases_names_fts, rowid, id, name, citations) "
                    "VALUES('delete', ?, ?, ?, ?)",
                    [(v[0], v[1], v[2], v[5]) for v in victims])
            cur.executemany("DELETE FROM cases WHERE rowid = ?", [(v[0],) for v in victims])
            deleted += len(victims)
            conn.commit()
        rate = (end - lo + 1) / max(1e-9, time.time() - t0)
        eta = (hi - end) / rate / 60 if rate > 1 else 0
        eta_s = f", ~{eta:.0f} min left" if eta >= 1 else ""
        print(f"  [purge] scanned through rowid {end:,} | deleted {deleted:,} "
              f"({rate:,.0f} rows/s{eta_s})", flush=True)
        start = end + 1

    remaining = cur.execute("SELECT COUNT(*) FROM cases").fetchone()[0]
    try:
        cur.execute("ANALYZE cases")
        conn.commit()
    except Exception:
        pass
    conn.close()
    print(f"[purge] Deleted {deleted:,} cases; {remaining:,} remain "
          f"({(time.time()-t0)/60:.1f} min). Start the app to refresh its counts.")

def sample_short_cases(db_path=DB_PATH, min_words=300, count=20):
    """Print N random cases that --purge-short would delete, with their full
    text, so the purge list can be eyeballed before deleting. Uses random
    rowid probes (instant) instead of scanning the whole corpus."""
    import random as _random
    print(f"\n[purge] Sampling up to {count} random cases with fewer than "
          f"{min_words} words from {db_path} (nothing is deleted)...\n")
    conn = sqlite3.connect(db_path, timeout=300)
    cur = conn.cursor()
    # Same formula as the purge: whitespace separators + 1.
    WORDS = ("COALESCE(LENGTH(text) - LENGTH(REPLACE(REPLACE(REPLACE(REPLACE(text, ' ', ''), "
             "CHAR(10), ''), CHAR(13), ''), CHAR(9), '')) + 1, 0)")
    lo = cur.execute("SELECT MIN(rowid) FROM cases").fetchone()[0] or 1
    hi = cur.execute("SELECT MAX(rowid) FROM cases").fetchone()[0] or 0
    victims, probes = [], 0
    while len(victims) < count and probes < 20000 and hi >= lo:
        ids = _random.sample(range(lo, hi + 1), min(500, max(count * 25, 100)))
        ph = ",".join("?" * len(ids))
        rows = cur.execute(
            f"SELECT name, COALESCE(court, '?'), COALESCE(court_type, '?'), "
            f"COALESCE(date_filed, '?'), COALESCE(text, ''), {WORDS} FROM cases "
            f"WHERE rowid IN ({ph}) AND {WORDS} < ?",
            ids + [min_words]).fetchall()
        victims.extend(rows)
        probes += len(ids)
    conn.close()
    victims = victims[:count]
    for i, (name, court, ctype, date, text, words) in enumerate(victims, 1):
        print(f"  {i}. {name}")
        print(f"     {court} ({ctype}) - filed {date} - {words} words")
        print(f"     {'-' * 70}")
        print("     " + " ".join((text or "").split()))
        print()
    print(f"[purge] {len(victims)} sampled case(s) shown. Word counts use the "
          f"same formula as the purge itself. Re-run for a fresh random sample.")

def _restore_progress_path(db_path):
    return str(db_path) + ".restore-progress.json"

def _restore_core(conn, rows_iter, ppath=None):
    """Apply paragraph-preserving clean_text to opinions already in the
    database. rows_iter yields the opinions dump's csv row dicts; rows are
    matched by opinion id and only the text column is updated - nothing is
    inserted or deleted, so no FTS rebuild is needed (whitespace changes do
    not move FTS5 token positions). ppath: progress file for resumption."""
    import json as _json
    cur = conn.cursor()
    pending, updates = [], []
    seen = updated = 0
    last_id = None
    resume_after = None
    if ppath and os.path.exists(ppath):
        try:
            with open(ppath) as f:
                resume_after = _json.load(f).get("last_id")
        except Exception:
            resume_after = None

    t0 = time.time()

    def match_and_clean():
        ids = [oid for oid, _ in pending]
        ph = ",".join("?" * len(ids))
        found = {row[0] for row in cur.execute(
            f"SELECT id FROM cases WHERE id IN ({ph})", ids)}
        for oid, row in pending:
            if oid in found:
                text = clean_text(row)
                if len(text) >= MIN_CHARS:
                    updates.append((text, oid))

    def flush():
        nonlocal updated
        if updates:
            cur.executemany("UPDATE cases SET text = ? WHERE id = ?", updates)
            conn.commit()
            updated += len(updates)
            updates.clear()
            rate = seen / max(1e-9, time.time() - t0)
            print(f"  [restore] scanned {seen:,} opinions | updated {updated:,} "
                  f"cases ({rate:,.0f} rows/s)", flush=True)
        # Never overwrite the progress file while still skipping (if the
        # resume point is never found, e.g. a different dump date, the
        # original marker must survive).
        if ppath and last_id and not resume_after:
            try:
                with open(ppath, "w") as f:
                    _json.dump({"last_id": last_id}, f)
            except Exception:
                pass

    for r in rows_iter:
        oid = str(r.get("id") or "")
        seen += 1
        if oid:
            last_id = oid
        if resume_after:
            if oid == resume_after:
                resume_after = None   # this one was already processed; skip it
            continue
        if oid:
            pending.append((oid, r))
        if len(pending) >= 5000:
            match_and_clean()
            pending.clear()
        if len(updates) >= 5000:
            flush()
    if pending:
        match_and_clean()
    flush()
    return seen, updated

def restore_paragraphs(db_path=DB_PATH, date_str=DEFAULT_DATE):
    """Re-stream the opinions bulk dump and replace each stored case's text
    with a paragraph-preserving version. Run with the app stopped. Matches by
    opinion id; updates only the text column, so no reindex is needed.
    Resumable via a progress file next to the database."""
    print(f"\n[restore] Streaming the {date_str} opinions dump to restore paragraph "
          f"breaks into {db_path}...", flush=True)
    t0 = time.time()
    conn = sqlite3.connect(db_path, timeout=300)
    cur = conn.cursor()
    cur.execute("PRAGMA journal_mode=WAL")
    cur.execute("PRAGMA busy_timeout=300000")
    cur.execute("PRAGMA synchronous=NORMAL")
    cur.execute("PRAGMA wal_autocheckpoint=1000")
    total_cases = cur.execute("SELECT COUNT(*) FROM cases").fetchone()[0]
    print(f"[restore] {total_cases:,} cases in the database; matching by opinion id "
          f"(no reindexing needed afterwards).", flush=True)
    ppath = _restore_progress_path(db_path)
    rd, p = stream_csv("opinions", date_str)
    try:
        seen, updated = _restore_core(conn, rd, ppath)
    finally:
        p.kill()
        conn.close()
    try:
        os.remove(ppath)
    except Exception:
        pass
    print(f"[restore] Done: scanned {seen:,} opinions, updated {updated:,} case "
          f"texts in {(time.time()-t0)/60:.1f} min. Paragraph breaks restored.",
          flush=True)

def ensure_indexes(db_path=DB_PATH):
    """Create the indexes CaseFind's fast search paths rely on, and give the
    query planner stats. Run with the app stopped: these are long write
    transactions on large databases (many minutes over network storage), and
    the app itself is strictly read-only by design."""
    print(f"\n[indexes] Ensuring search indexes on {db_path}...")
    t0 = time.time()
    conn = sqlite3.connect(db_path, timeout=300)
    cur = conn.cursor()
    cur.execute("PRAGMA journal_mode=WAL")
    cur.execute("PRAGMA busy_timeout=300000")
    for name, stmt in (
        ("idx_cases_court_type", "CREATE INDEX IF NOT EXISTS idx_cases_court_type ON cases(court_type)"),
        ("idx_cases_court", "CREATE INDEX IF NOT EXISTS idx_cases_court ON cases(court)"),
        ("idx_cases_date", "CREATE INDEX IF NOT EXISTS idx_cases_date ON cases(date_filed)"),
        ("idx_cases_ctype_date", "CREATE INDEX IF NOT EXISTS idx_cases_ctype_date ON cases(court_type, date_filed)"),
    ):
        try:
            cur.execute(stmt)
            conn.commit()
            print(f"  [index] {name}: ok ({time.time()-t0:.0f}s)", flush=True)
        except Exception as e:
            print(f"  [index] {name}: skipped ({e})", flush=True)
    try:
        if cur.execute("SELECT 1 FROM sqlite_stat1 WHERE tbl = 'cases' LIMIT 1").fetchone():
            print("  [stats] planner stats already present")
        else:
            print("  [stats] running ANALYZE cases...", flush=True)
            cur.execute("ANALYZE cases")
            conn.commit()
            print(f"  [stats] done ({time.time()-t0:.0f}s)", flush=True)
    except Exception as e:
        print(f"  [stats] skipped ({e})", flush=True)
    conn.close()
    print(f"[indexes] done in {(time.time()-t0)/60:.1f} min.")

def fix_court_types(db_path=DB_PATH):
    print(f"\n[maintenance] Repairing court_type values in {db_path}...")
    t0 = time.time()
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("PRAGMA journal_mode=WAL")
    cur.execute("PRAGMA busy_timeout=30000")

    appellate_list = "','".join(FEDERAL_APPELLATE)
    special_list = "'ccpa','cusx','cit','cofc','armfor','cavc','tax'"

    # 1. SCOTUS
    cur.execute("UPDATE cases SET court_type = 'SCOTUS' WHERE LOWER(court) = 'scotus'")
    # 2. Appellate Courts
    cur.execute(f"UPDATE cases SET court_type = 'F' WHERE LOWER(court) IN ('{appellate_list}') AND LOWER(court) != 'scotus'")
    # 3. Special Courts
    cur.execute(f"UPDATE cases SET court_type = 'FS' WHERE LOWER(court) IN ({special_list})")
    # 4. District Courts (everything federal that is not SCOTUS, Appellate, Special, or Bankruptcy)
    cur.execute(f"""
        UPDATE cases SET court_type = 'FD' 
        WHERE LOWER(court) NOT IN ('scotus', '{appellate_list}', {special_list})
          AND LOWER(court) NOT LIKE '%bankr%'
          AND LOWER(court) NOT LIKE '%bap%'
          AND (court_type IS NULL OR court_type = 'F' OR court_type = '')
    """)
    conn.commit()

    print(f"[maintenance] Repaired court_type distribution in {time.time()-t0:.1f}s:")
    for ct, cnt in cur.execute("SELECT court_type, COUNT(*) FROM cases GROUP BY court_type ORDER BY COUNT(*) DESC").fetchall():
        print(f"  {ct or 'NULL'}: {cnt:,} cases")
    conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest federal cases into CaseFind SQLite database")
    parser.add_argument("--limit", type=int, default=None, help="Stop after N cases (omit to ingest all)")
    parser.add_argument("--date", type=str, default=DEFAULT_DATE, help="CourtListener dump date (YYYY-MM-DD)")
    parser.add_argument("--keep-existing", action="store_true", help="Append without clearing previous DB")
    parser.add_argument("--resume", action="store_true", help="Resume ingestion without clearing previously saved cases")
    parser.add_argument("--appeals-only", action="store_true", help="Ingest only Supreme Court and Circuit Appeals")
    parser.add_argument("--include-bankruptcy", action="store_true", help="Also ingest bankruptcy courts (excluded by default)")
    parser.add_argument("--court", type=str, default=None, help="Restrict ingestion to one court id (e.g. scotus, ca9, nyed)")
    parser.add_argument("--fix-court-types", action="store_true", help="Repair district court_type flags in existing database")
    parser.add_argument("--build-fts", action="store_true", help="Build or rebuild FTS5 full-text search table on current database")
    parser.add_argument("--ensure-indexes", action="store_true", help="Create/verify search indexes + planner stats (run with the app stopped)")
    parser.add_argument("--purge-short", type=int, default=None, metavar="MIN_WORDS",
                        help="Delete cases whose opinion text has fewer than MIN_WORDS words, all courts (run with the app stopped)")
    parser.add_argument("--dry-run", action="store_true", help="With --purge-short: report what would be deleted, without deleting")
    parser.add_argument("--sample", type=int, default=None, metavar="N",
                        help="With --purge-short: print N random matching cases with full text, without deleting")
    parser.add_argument("--restore-paragraphs", action="store_true",
                        help="Re-stream the opinions dump and restore real paragraph breaks in stored texts (app stopped; no reindex needed)")
    args = parser.parse_args()

    if args.restore_paragraphs:
        restore_paragraphs(DB_PATH, date_str=args.date)
        sys.exit(0)

    if args.purge_short is not None:
        if args.sample:
            sample_short_cases(DB_PATH, min_words=args.purge_short, count=args.sample)
        else:
            purge_short_cases(DB_PATH, min_words=args.purge_short, dry_run=args.dry_run)
        sys.exit(0)

    if args.ensure_indexes:
        ensure_indexes(DB_PATH)
        sys.exit(0)

    if args.fix_court_types:
        fix_court_types(DB_PATH)
        if args.build_fts:
            build_fts(DB_PATH)
        sys.exit(0)

    if args.build_fts:
        build_fts(DB_PATH)
        sys.exit(0)

    run_ingest(
        date_str=args.date,
        target_count=args.limit,
        clear=not (args.keep_existing or args.resume),
        include_districts=not args.appeals_only,
        include_bankruptcy=args.include_bankruptcy,
        court_filter=(args.court.lower() if args.court else None),
        resume=(args.resume or args.keep_existing)
    )
