import os
import sys
import time
import threading
import sqlite3
import json
import re
import subprocess
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder="dist")

# ngrok Auth Token (override via NGROK_AUTH_TOKEN environment variable)
NGROK_AUTH_TOKEN = os.environ.get("NGROK_AUTH_TOKEN", "3KFi44ps2pXYBx4QavTJzyypC7q_rzRMppJXteo4SVz2ob3L")

# Path to SQLite database (checks ~/cases.db first, then ./cases.db)
default_db = os.path.expanduser("~/cases.db") if os.path.exists(os.path.expanduser("~/cases.db")) else "cases.db"
DB_PATH = os.environ.get("DB_PATH", default_db)

def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=60)
    try:
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA busy_timeout=60000")
        conn.execute("PRAGMA temp_store=MEMORY")
        conn.execute("PRAGMA cache_size=-131072")
        conn.execute("PRAGMA mmap_size=1073741824")
    except Exception:
        pass
    conn.row_factory = sqlite3.Row
    return conn

def map_court_type(court_str):
    court_lower = (court_str or "").lower()
    if court_lower == "scotus":
        return "SCOTUS"
    if any(c in court_lower for c in ["ca1", "ca2", "ca3", "ca4", "ca5", "ca6", "ca7", "ca8", "ca9", "ca10", "ca11", "cadc", "cafc", "appeals"]):
        return "F"
    elif "bankr" in court_lower or "bap" in court_lower or (len(court_lower) >= 3 and court_lower.endswith("b")):
        return "FB"
    elif any(c in court_lower for c in ["claim", "trade", "tax", "fs"]):
        return "FS"
    return "FD"

def build_fts_query(words, column=None):
    """Build an FTS5 MATCH expression; filter single-letter connectors and stopwords."""
    stop = {"v", "vs", "versus", "in", "re", "and", "the", "of", "et", "al"}
    meaningful = [w for w in words if w.lower() not in stop and len(w) > 1] or words
    safe = [w.replace('"', " ").strip() for w in meaningful if w.strip()]
    if not safe:
        return None
    if column:
        return " AND ".join(f'{column}:"{w}"' for w in safe)
    return " AND ".join(f'"{w}"' for w in safe)

def format_citations(raw_citations):
    if not raw_citations:
        return []
    if isinstance(raw_citations, list):
        return [c for c in (_cite_str(c) for c in raw_citations) if c]
    try:
        parsed = json.loads(raw_citations)
        if isinstance(parsed, list):
            return [c for c in (_cite_str(c) for c in parsed) if c]
    except Exception:
        pass
    return [c.strip() for c in str(raw_citations).split(",") if c.strip()]

def _cite_str(c):
    """CourtListener stores citations as JSON objects like {"cite": "384 U.S. 436"}."""
    if isinstance(c, dict):
        return str(c.get("cite") or "").strip()
    return str(c).strip()

# Cached DB facts so per-request searches don't repeat metadata scans
_FB_CHECK = {"checked_at": 0.0, "has": True}
_BROWSE_TOTAL = {"ts": 0.0, "value": None}
_warned_no_fts = False

def db_has_bankruptcy(conn, ctype_col):
    """True if bankruptcy (FB) rows exist. Checked at most every 10 minutes:
    the check is a metadata-only scan (opinion text lives in overflow pages
    and is never read)."""
    if time.time() - _FB_CHECK["checked_at"] > 600:
        try:
            row = conn.execute(
                f"SELECT 1 FROM cases WHERE UPPER(COALESCE({ctype_col}, '')) = 'FB' LIMIT 1"
            ).fetchone()
            _FB_CHECK["has"] = row is not None
        except Exception:
            _FB_CHECK["has"] = True
        _FB_CHECK["checked_at"] = time.time()
    return _FB_CHECK["has"]

# ---------------- API ENDPOINTS ----------------


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, ngrok-skip-browser-warning"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

@app.route("/api/features")
def features():
    # Semantic search disabled for now
    return jsonify({"semantic": False})

@app.route("/api/courts")
def get_courts():
    if not os.path.exists(DB_PATH):
        return jsonify([{**d, "count": 0} for d in [
            {"value": "SCOTUS", "label": "Supreme Court"},
            {"value": "F", "label": "Appeals Courts"},
            {"value": "FD", "label": "District Courts"},
            {"value": "FS", "label": "Special Jurisdiction"},
        ]])
    maybe_start_warmup()
    conn = get_db()
    try:
        # Bankruptcy (FB) intentionally excluded
        return jsonify(_load_court_counts(conn))
    finally:
        conn.close()

def warn_no_fts():
    global _warned_no_fts
    if not _warned_no_fts:
        _warned_no_fts = True
        print("[search] WARNING: cases_fts index missing or empty - opinion-text search is "
              "disabled (a LIKE scan over the text column would take minutes). Rebuild the "
              "index with: python ingest_cases.py --build-fts", flush=True)

def python_snippet(text, words, max_words=24):
    """First-match-centered word window over the opinion text. Done in Python
    on the (at most 20) page rows: the FTS5 snippet() JOIN could end up
    iterating a huge MATCH set, which is slow on multi-million-case DBs."""
    if not text or not words:
        return None
    toks = text.split()
    if not toks:
        return None
    stripped = [t.strip('.,;:()[]{}"\'?!*#%&$') for t in toks]
    hit = next((i for i, t in enumerate(stripped) if t.lower() in words), None)
    if hit is None:
        hit = next((i for i, t in enumerate(toks)
                    if any(w in t.lower() for w in words)), None)
    if hit is None:
        s = " ".join(toks[:max_words])
        return s + (" …" if len(toks) > max_words else "")
    start = max(0, hit - 8)
    end = min(len(toks), start + max_words)
    s = " ".join(toks[start:end])
    if start > 0:
        s = "… " + s
    if end < len(toks):
        s += " …"
    return s

_COURTS_CACHE = {"ts": 0.0, "data": None}
_BROWSE_FILTERED = {}
_WARM = {"done": False}
_WARM_LOCK = threading.Lock()

def _load_court_counts(conn):
    """Per-court-type counts via index-friendly queries; cached 10 minutes."""
    if _COURTS_CACHE["data"] is not None and time.time() - _COURTS_CACHE["ts"] < 600:
        return _COURTS_CACHE["data"]
    court_defs = [
        {"value": "SCOTUS", "label": "Supreme Court"},
        {"value": "F", "label": "Appeals Courts"},
        {"value": "FD", "label": "District Courts"},
        {"value": "FS", "label": "Special Jurisdiction"},
    ]
    cols = [col[1] for col in conn.execute("PRAGMA table_info(cases)").fetchall()]
    court_col = "court" if "court" in cols else "court_id"

    court_counts = {"SCOTUS": 0, "F": 0, "FD": 0, "FS": 0}
    if "court_type" in cols:
        # ingest stores canonical uppercase court_type / lowercase court ids,
        # so plain GROUP BY rides the covering idx_cases_court_type.
        rows = conn.execute(
            "SELECT court_type as ctype, COUNT(*) as cnt FROM cases GROUP BY court_type"
        ).fetchall()
        base = {(r["ctype"] or "").upper(): r["cnt"] for r in rows}
        scotus_legacy = 0
        if base.get("F"):
            # Legacy DBs stored SCOTUS under court_type 'F'
            scotus_legacy = conn.execute(
                "SELECT COUNT(*) as c FROM cases WHERE court = 'scotus' AND court_type = 'F'"
            ).fetchone()["c"]
        court_counts["SCOTUS"] = base.get("SCOTUS", 0) + scotus_legacy
        court_counts["F"] = max(0, base.get("F", 0) - scotus_legacy)
        court_counts["FD"] = base.get("FD", 0)
        court_counts["FS"] = base.get("FS", 0)

        # Fallback for databases where district courts were stored under 'F'
        if court_counts["FD"] == 0 and court_counts["F"] > 0:
            appellate_list = "','".join(["ca1", "ca2", "ca3", "ca4", "ca5", "ca6", "ca7", "ca8", "ca9", "ca10", "ca11", "cadc", "cafc"])
            special_list = "'ccpa', 'cusx', 'cit', 'cofc', 'armfor', 'cavc', 'tax'"
            actual_appeals = conn.execute(f"SELECT COUNT(*) as c FROM cases WHERE {court_col} IN ('{appellate_list}')").fetchone()["c"]
            actual_scotus = conn.execute(f"SELECT COUNT(*) as c FROM cases WHERE {court_col} = 'scotus'").fetchone()["c"]
            actual_special = conn.execute(f"SELECT COUNT(*) as c FROM cases WHERE {court_col} IN ({special_list})").fetchone()["c"]
            total_cases = conn.execute("SELECT COUNT(*) as c FROM cases").fetchone()["c"]

            court_counts["SCOTUS"] = actual_scotus
            court_counts["F"] = actual_appeals
            court_counts["FS"] = actual_special
            court_counts["FD"] = max(0, total_cases - (actual_scotus + actual_appeals + actual_special))
    else:
        rows = conn.execute(f"SELECT {court_col} as court, COUNT(*) as cnt FROM cases GROUP BY {court_col}").fetchall()
        for r in rows:
            t = map_court_type(r["court"])
            if t in court_counts:
                court_counts[t] += r["cnt"]

    data = [{**d, "count": court_counts[d["value"]]} for d in court_defs]
    _COURTS_CACHE["data"] = data
    _COURTS_CACHE["ts"] = time.time()
    return data

def _run_warmup():
    try:
        conn = get_db()
        try:
            _load_court_counts(conn)
            _BROWSE_TOTAL["value"] = conn.execute(
                "SELECT COUNT(*) AS total FROM cases").fetchone()["total"]
            _BROWSE_TOTAL["ts"] = time.time()
            cols = [col[1] for col in conn.execute("PRAGMA table_info(cases)").fetchall()]
            if "court_type" in cols:
                db_has_bankruptcy(conn, "court_type")
            if os.environ.get("CASEFIND_SKIP_INDEX") != "1":
                try:
                    # Ensure the indexes the fast paths rely on exist.
                    # IF NOT EXISTS = no-op when present; built once in the
                    # background so no user request ever waits on them.
                    conn.execute("CREATE INDEX IF NOT EXISTS idx_cases_court_type ON cases(court_type)")
                    conn.execute("CREATE INDEX IF NOT EXISTS idx_cases_court ON cases(court)")
                    conn.execute("CREATE INDEX IF NOT EXISTS idx_cases_date ON cases(date_filed)")
                    conn.execute("CREATE INDEX IF NOT EXISTS idx_cases_ctype_date ON cases(court_type, date_filed)")
                    conn.commit()
                except Exception as e:
                    print(f"[warmup] index creation skipped: {e}", flush=True)
            try:
                # Table-scoped ANALYZE: gives the planner stats for the cases
                # indexes only (a full ANALYZE would grind the FTS b-trees
                # too). Skipped when stats already exist so restarts stay cheap.
                has_stats = conn.execute(
                    "SELECT 1 FROM sqlite_stat1 WHERE tbl = 'cases' LIMIT 1"
                ).fetchone()
                if not has_stats:
                    conn.execute("ANALYZE cases")
                    conn.commit()
            except Exception:
                pass
        finally:
            conn.close()
        print("[warmup] caches warm (court counts, totals, indexes, stats)", flush=True)
    except Exception as e:
        print(f"[warmup] skipped: {e}", flush=True)

def maybe_start_warmup():
    with _WARM_LOCK:
        if _WARM["done"]:
            return
        _WARM["done"] = True
    threading.Thread(target=_run_warmup, daemon=True).start()

@app.route("/api/search")
def search():
    if not os.path.exists(DB_PATH):
        return jsonify({"total": 0, "page": 1, "page_size": 20, "results": []})

    maybe_start_warmup()

    q = request.args.get("q", "").strip()
    scope = request.args.get("scope", "title").strip().lower()
    if scope not in ("title", "text", "both"):
        scope = "title"
    court_type = request.args.get("court_type", "").strip()
    year_from = request.args.get("year_from", "").strip()
    year_to = request.args.get("year_to", "").strip()
    try:
        page = int(request.args.get("page", 1))
    except ValueError:
        page = 1
    page = max(1, page)
    page_size = 20
    offset = (page - 1) * page_size
    fetch_n = offset + page_size

    conn = get_db()
    try:
        cols = [col[1] for col in conn.execute("PRAGMA table_info(cases)").fetchall()]
        name_col = "name" if "name" in cols else ("case_name" if "case_name" in cols else cols[1])
        full_name_col = "case_name_full" if "case_name_full" in cols else None
        date_col = "date" if "date" in cols else ("date_filed" if "date_filed" in cols else "date")
        text_col = "text" if "text" in cols else ("plain_text" if "plain_text" in cols else "content")
        court_col = "court" if "court" in cols else "court_id"
        cite_col = "citations" if "citations" in cols else None
        cite_cnt_col = "citation_count" if "citation_count" in cols else None
        ctype_col = "court_type" if "court_type" in cols else None

        # Detect FTS5 index and verify it contains rows
        has_fts = False
        fts_cols = []
        try:
            fts_row = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='cases_fts'").fetchone()
            if fts_row:
                fts_cols = [r[1] for r in conn.execute("PRAGMA table_info(cases_fts)").fetchall()]
                # Verify that cases_fts has index data by testing a probe query
                probe = conn.execute("SELECT 1 FROM cases_fts LIMIT 1").fetchone()
                has_fts = bool(fts_cols) and (probe is not None)
        except Exception:
            has_fts = False

        fts_has_name = "name" in fts_cols
        fts_has_text = "text" in fts_cols
        fts_has_cite = "citations" in fts_cols

        # Date index (created by ingest_cases.py). Forcing it for LIMIT-ed page
        # queries makes SQLite walk the index in reverse and stop as soon as
        # the page is filled, instead of probing the main table once per FTS
        # match and sorting the entire match set.
        date_idx = None
        try:
            idx_names = {r[0] for r in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='cases'").fetchall()}
            for cand in (f"idx_cases_{date_col}", "idx_cases_date", "idx_cases_date_filed"):
                if cand in idx_names:
                    date_idx = cand
                    break
        except Exception:
            date_idx = None
        idx_hint = f"INDEXED BY {date_idx}" if date_idx else ""

        select_cols = [f"id, {name_col} as case_name, {court_col} as court, {date_col} as date_filed"]
        if ctype_col:
            select_cols.append(f"{ctype_col} as court_type")
        if cite_col:
            select_cols.append(f"{cite_col} as citations")
        if cite_cnt_col:
            select_cols.append(f"{cite_cnt_col} as citation_count")
        select_sql = ", ".join(select_cols)

        def row_filter_conds():
            conds = []
            c_params = []
            court_filter = [c.strip().upper() for c in court_type.split(",") if c.strip()]
            if court_filter:
                or_parts = []
                if ctype_col:
                    # ingest stores canonical values (uppercase court_type,
                    # lowercase court ids), so plain equality lets SQLite use
                    # idx_cases_court_type / idx_cases_court as covering seeks
                    # instead of scanning every leaf page.
                    appellate_tuple = "','".join(["ca1", "ca2", "ca3", "ca4", "ca5", "ca6", "ca7", "ca8", "ca9", "ca10", "ca11", "cadc", "cafc"])
                    special_tuple = "'ccpa', 'cusx', 'cit', 'cofc', 'armfor', 'cavc', 'tax'"
                    for ct in court_filter:
                        if ct == "SCOTUS":
                            or_parts.append(f"({ctype_col} = 'SCOTUS' OR {court_col} = 'scotus')")
                        elif ct == "F":
                            or_parts.append(f"({ctype_col} = 'F' AND {court_col} IN ('{appellate_tuple}'))")
                        elif ct == "FD":
                            or_parts.append(f"({ctype_col} = 'FD' OR ({ctype_col} = 'F' AND {court_col} NOT IN ('scotus', '{appellate_tuple}', {special_tuple})))")
                        elif ct == "FS":
                            or_parts.append(f"({ctype_col} = 'FS' OR {court_col} IN ({special_tuple}))")
                        else:
                            or_parts.append(f"{ctype_col} = ?")
                            c_params.append(ct)
                else:
                    appellate_ids = ",".join([f"'{c}'" for c in ["ca1", "ca2", "ca3", "ca4", "ca5", "ca6", "ca7", "ca8", "ca9", "ca10", "ca11", "cadc", "cafc"]])
                    for ct in court_filter:
                        if ct == "SCOTUS":
                            or_parts.append(f"{court_col} = 'scotus'")
                        elif ct == "F":
                            or_parts.append(f"{court_col} IN ({appellate_ids})")
                        elif ct == "FB":
                            or_parts.append(f"({court_col} LIKE '%bankr%' OR SUBSTR({court_col}, -1) = 'b')")
                        else:
                            or_parts.append("1=0")
                conds.append("(" + " OR ".join(or_parts) + ")")

            # Bankruptcy rows are excluded at ingestion time; only pay for this
            # filter (and lose the pure-FTS fast count) when such rows exist.
            if ctype_col and db_has_bankruptcy(conn, ctype_col):
                conds.append(f"({ctype_col} IS NULL OR {ctype_col} <> 'FB')")
            if year_from:
                # Range predicates keep idx_cases_date usable (SUBSTR() would not)
                conds.append(f"{date_col} >= ?")
                c_params.append(year_from)
            if year_to:
                conds.append(f"{date_col} <= ?")
                c_params.append(f"{year_to}-12-31")
            return conds, c_params

        def shape_rows(rows, snippets):
            results = []
            for r in rows:
                court_str = r["court"]
                stored_type = r["court_type"] if (ctype_col and "court_type" in r.keys()) else None
                if stored_type:
                    stored_type = str(stored_type).upper()
                    if stored_type == "F" and (court_str or "").lower() == "scotus":
                        stored_type = "SCOTUS"
                c_type = stored_type or map_court_type(court_str)
                item = {
                    "id": r["id"],
                    "case_name": r["case_name"] or "Unknown Case",
                    "court": court_str or "Federal Court",
                    "court_type": c_type,
                    "date_filed": str(r["date_filed"] or "")[:10],
                    "citations": format_citations(r["citations"] if cite_col else []),
                    "citation_count": r["citation_count"] if cite_cnt_col else 0
                }
                if r["id"] in snippets:
                    item["snippet"] = snippets[r["id"]]
                results.append(item)
            return results

        snippets = {}

        # ---------- Browse mode (no query) ----------
        if not q:
            conds, c_params = row_filter_conds()
            where_sql = ("WHERE " + " AND ".join(conds)) if conds else ""
            now = time.time()
            total = None
            if not conds and _BROWSE_TOTAL["value"] is not None and now - _BROWSE_TOTAL["ts"] < 600:
                total = _BROWSE_TOTAL["value"]
            elif conds:
                cached = _BROWSE_FILTERED.get((court_type, year_from, year_to))
                if cached and now - cached["ts"] < 600:
                    total = cached["total"]
            if total is None:
                total = conn.execute(f"SELECT COUNT(*) AS total FROM cases {where_sql}", c_params).fetchone()["total"]
                now = time.time()
                if not conds:
                    _BROWSE_TOTAL["value"] = total
                    _BROWSE_TOTAL["ts"] = now
                else:
                    if len(_BROWSE_FILTERED) > 64:
                        _BROWSE_FILTERED.clear()
                    _BROWSE_FILTERED[(court_type, year_from, year_to)] = {"ts": now, "total": total}
            # Unfiltered browse rides the date index for instant pages; with
            # filters let the planner choose so it can use the court_type
            # index instead of fetching every row in date order.
            hint = idx_hint if not conds else ""
            rows = conn.execute(
                f"SELECT {select_sql} FROM cases {hint} {where_sql} ORDER BY {date_col} DESC LIMIT ? OFFSET ?",
                c_params + [page_size, offset]).fetchall()
            return jsonify({"total": total, "page": page, "page_size": page_size,
                            "results": shape_rows(rows, snippets)})

        # ---------- Query search ----------
        clean_q = re.sub(r'[^a-zA-Z0-9\s"]', ' ', q).strip()
        words = [w for w in clean_q.split() if w]

        fts_name_q = build_fts_query(words, "name") if (has_fts and fts_has_name and words) else None
        fts_text_q = build_fts_query(words, "text") if (has_fts and fts_has_text and words) else None
        fts_any_q = build_fts_query(words, None) if (has_fts and words) else None

        conds, c_params = row_filter_conds()
        conds_sql = (" AND " + " AND ".join(conds)) if conds else ""

        def fts_pass(match_q):
            """Return (match count, newest fetch_n rows).

            Without row filters the count is a pure FTS count with no probes
            into the main table at all, and the page query rides the date
            index and stops early. With filters the date index would instead
            force a row fetch per index entry until the page fills, so let the
            planner drive from the (covering) filter indexes."""
            if conds:
                t = conn.execute(
                    f"SELECT COUNT(*) AS total FROM cases WHERE rowid IN "
                    f"(SELECT rowid FROM cases_fts WHERE cases_fts MATCH ?){conds_sql}",
                    [match_q] + c_params).fetchone()["total"]
                rows = conn.execute(
                    f"SELECT {select_sql} FROM cases WHERE rowid IN "
                    f"(SELECT rowid FROM cases_fts WHERE cases_fts MATCH ?){conds_sql}"
                    f" ORDER BY {date_col} DESC LIMIT ?",
                    [match_q] + c_params + [fetch_n]).fetchall()
            else:
                t = conn.execute(
                    "SELECT COUNT(*) AS total FROM cases_fts WHERE cases_fts MATCH ?",
                    [match_q]).fetchone()["total"]
                rows = conn.execute(
                    f"SELECT {select_sql} FROM cases {idx_hint} WHERE rowid IN "
                    f"(SELECT rowid FROM cases_fts WHERE cases_fts MATCH ?)"
                    f" ORDER BY {date_col} DESC LIMIT ?",
                    [match_q] + [fetch_n]).fetchall()
            return t, rows

        # passes: (rows, rank) - rank 0 sorts ahead of rank 1 (title matches first)
        passes = []
        total = 0
        used_fts = False
        primary_q = None
        try:
            if scope == "title" and fts_name_q:
                total, rows = fts_pass(fts_name_q)
                used_fts, primary_q = True, fts_name_q
                passes.append((rows, 0))
            elif scope == "text" and fts_text_q:
                total, rows = fts_pass(fts_text_q)
                used_fts, primary_q = True, fts_text_q
                passes.append((rows, 0))
            elif scope == "both" and fts_any_q:
                total, rows = fts_pass(fts_any_q)
                used_fts, primary_q = True, fts_any_q
                if fts_name_q:
                    # Title matches rank ahead of text-only matches
                    _, name_rows = fts_pass(fts_name_q)
                    passes.append((name_rows, 0))
                    passes.append((rows, 1))
                else:
                    passes.append((rows, 0))
        except Exception:
            # Malformed FTS query or execution error - fall back to the
            # name/citation LIKE pass below.
            used_fts, total, passes, primary_q = False, 0, [], None

        # Citation search (query contains digits, e.g. "384 U.S. 436"). When
        # the FTS index has a citations column this is pure index lookups.
        # Otherwise (index built before that column existed) it degrades to
        # one bounded scan over the small citations column.
        is_cite_q = any(ch.isdigit() for ch in q)
        if used_fts and cite_col and is_cite_q and scope in ("title", "both"):
            if fts_has_cite:
                cite_q = build_fts_query(words, "citations")
                if cite_q:
                    ct, crows = fts_pass(cite_q)
                    total += ct
                    # Exact citation matches rank ahead of same-token matches
                    # (e.g. "384 U.S. 436" before "384 F.3d 436").
                    ql = q.lower()
                    exact, token = [], []
                    for r in crows:
                        (exact if ql in str(r["citations"] or "").lower() else token).append(r)
                    passes.append((exact, 0))
                    passes.append((token, 1))
            else:
                crows = conn.execute(
                    f"SELECT COUNT(*) OVER () AS _total, {select_sql} FROM cases {idx_hint} "
                    f"WHERE {cite_col} LIKE ?{conds_sql} ORDER BY {date_col} DESC LIMIT ?",
                    [f"%{q}%"] + c_params + [fetch_n]).fetchall()
                total += crows[0]["_total"] if crows else 0
                passes.append((crows, 0))

        # Zero results so far: retry over the name/citation columns only.
        # NEVER fall back to LIKE over the opinion text - that is a scan of
        # the whole multi-gigabyte text column, which is what made searches
        # spin for a minute and then time out.
        if total == 0 and scope in ("title", "both") and words:
            significant = [w for w in words if w.lower() not in ("v", "vs", "versus")] or words
            clauses = []
            lparams = []
            for w in significant:
                if full_name_col:
                    clauses.append(f"({name_col} LIKE ? OR {full_name_col} LIKE ?)")
                    lparams.extend([f"%{w}%", f"%{w}%"])
                else:
                    clauses.append(f"{name_col} LIKE ?")
                    lparams.append(f"%{w}%")
            cond = "(" + " AND ".join(clauses) + ")"
            if cite_col:
                cond = f"({cond} OR {cite_col} LIKE ?)"
                lparams.append(f"%{q}%")
            lrows = conn.execute(
                f"SELECT COUNT(*) OVER () AS _total, {select_sql} FROM cases {idx_hint} "
                f"WHERE {cond}{conds_sql} ORDER BY {date_col} DESC LIMIT ?",
                lparams + c_params + [fetch_n]).fetchall()
            lt = lrows[0]["_total"] if lrows else 0
            if lt > 0:
                total = lt
                passes.append((lrows, 0))

        if scope == "text" and not used_fts and not has_fts:
            warn_no_fts()

        # Merge passes: rank first, then newest first, deduped by id.
        merged = [(rank, r) for rows, rank in passes for r in rows]
        merged.sort(key=lambda item: (item[1]["date_filed"] or ""), reverse=True)
        merged.sort(key=lambda item: item[0])
        seen = set()
        page_rows = []
        for _, r in merged:
            rid = r["id"]
            if rid in seen:
                continue
            seen.add(rid)
            page_rows.append(r)
        page_rows = page_rows[offset:offset + page_size]

        if page_rows and q and scope in ("text", "both") and words:
            try:
                ids = [r["id"] for r in page_rows]
                id_placeholders = ",".join(["?"] * len(ids))
                trows = conn.execute(
                    f"SELECT id, {text_col} FROM cases WHERE id IN ({id_placeholders})",
                    ids).fetchall()
                wl = {w.lower() for w in words if len(w) > 1}
                for tr in trows:
                    s = python_snippet(tr[1], wl)
                    if s:
                        snippets[tr[0]] = s
            except Exception:
                snippets = {}

        return jsonify({
            "total": total,
            "page": page,
            "page_size": page_size,
            "results": shape_rows(page_rows, snippets)
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": f"Database query error: {str(e)}",
            "total": 0,
            "page": page,
            "page_size": page_size,
            "results": []
        }), 500
    finally:
        conn.close()

@app.route("/api/case/<path:case_id>")
def get_case(case_id):
    if not os.path.exists(DB_PATH):
        return jsonify({"error": "Database not found"}), 404

    conn = get_db()
    cols = [col[1] for col in conn.execute("PRAGMA table_info(cases)").fetchall()]

    name_col = "name" if "name" in cols else "case_name"
    full_name_col = "case_name_full" if "case_name_full" in cols else name_col
    date_col = "date" if "date" in cols else "date_filed"
    text_col = "text" if "text" in cols else "plain_text"
    court_col = "court" if "court" in cols else "court_id"
    cite_col = "citations" if "citations" in cols else None
    cite_cnt_col = "citation_count" if "citation_count" in cols else None
    jurisdiction_col = "jurisdiction" if "jurisdiction" in cols else None

    row = conn.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Case not found"}), 404

    cites = format_citations(row[cite_col]) if cite_col else []

    stored_type = str(row["court_type"] or "").upper() if ("court_type" in row.keys() and row["court_type"]) else ""
    if stored_type == "F" and (row[court_col] or "").lower() == "scotus":
        stored_type = "SCOTUS"
    c_type = stored_type or map_court_type(row[court_col])
    status = str(row["status"]) if ("status" in row.keys() and row["status"]) else "Precedential"

    return jsonify({
        "id": row["id"],
        "case_name": row[name_col] or "Unknown Case",
        "case_name_full": row[full_name_col] or row[name_col],
        "court": row[court_col] or "Federal Court",
        "court_type": c_type,
        "jurisdiction": row[jurisdiction_col] if jurisdiction_col else "US Federal",
        "date_filed": str(row[date_col] or "")[:10],
        "citations": cites,
        "citation_count": row[cite_cnt_col] if cite_cnt_col else 0,
        "status": status,
        "text": row[text_col] or "No text available."
    })

# ---------------- STATIC FRONTEND ----------------

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    dist_dir = os.path.join(os.path.dirname(__file__), "dist")
    if path != "" and os.path.exists(os.path.join(dist_dir, path)):
        return send_from_directory(dist_dir, path)
    if os.path.exists(os.path.join(dist_dir, "index.html")):
        return send_from_directory(dist_dir, "index.html")
    return "CaseFind frontend dist/ not found. Run 'npm run build' first.", 404

# ---------------- START NGROK & SERVER ----------------

def start_ngrok(port=8001):
    try:
        from pyngrok import ngrok, conf
    except ImportError:
        print("[ngrok] Installing pyngrok package...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "pyngrok"])
        from pyngrok import ngrok, conf

    try:
        ngrok.set_auth_token(NGROK_AUTH_TOKEN)
        tunnel = ngrok.connect(port)
        print("\n" + "=" * 64)
        print(f"  CaseFind is live on the web at:")
        print(f"  >>> {tunnel.public_url} <<<")
        print("=" * 64 + "\n")
        return tunnel.public_url
    except Exception as e:
        print(f"[ngrok] Warning: Could not start tunnel automatically: {e}")
        return None

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    start_ngrok(port)
    print(f"Local server listening on http://0.0.0.0:{port} (DB: {DB_PATH})")
    app.run(host="0.0.0.0", port=port)
