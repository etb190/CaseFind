import os
import sys
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
    conn = sqlite3.connect(DB_PATH)
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
    """Build an FTS5 MATCH expression; all words are ANDed together as quoted phrases.
    Optionally restrict matches to a single FTS column (e.g. 'name' or 'text')."""
    safe = [w.replace('"', " ").strip() for w in words if w.strip()]
    if not safe:
        return None
    if column:
        return " AND ".join(f'{column}:"{w}"' for w in safe)
    return " AND ".join(f'"{w}"' for w in safe)

def format_citations(raw_citations):
    if not raw_citations:
        return []
    if isinstance(raw_citations, list):
        return raw_citations
    try:
        parsed = json.loads(raw_citations)
        if isinstance(parsed, list):
            return parsed
    except Exception:
        pass
    return [c.strip() for c in str(raw_citations).split(",") if c.strip()]

# ---------------- API ENDPOINTS ----------------

@app.route("/api/features")
def features():
    # Semantic search disabled for now
    return jsonify({"semantic": False})

@app.route("/api/courts")
def get_courts():
    court_defs = [
        {"value": "SCOTUS", "label": "Supreme Court"},
        {"value": "F", "label": "Appeals Courts"},
        {"value": "FD", "label": "District Courts"},
        {"value": "FS", "label": "Special Jurisdiction"},
    ]
    if not os.path.exists(DB_PATH):
        return jsonify([{**d, "count": 0} for d in court_defs])

    conn = get_db()
    cols = [col[1] for col in conn.execute("PRAGMA table_info(cases)").fetchall()]
    court_col = "court" if "court" in cols else "court_id"

    court_counts = {"SCOTUS": 0, "F": 0, "FD": 0, "FS": 0}
    if "court_type" in cols:
        rows = conn.execute("SELECT UPPER(COALESCE(court_type, '')) as ctype, COUNT(*) as cnt FROM cases GROUP BY ctype").fetchall()
        base = {r["ctype"]: r["cnt"] for r in rows}
        scotus_legacy = 0
        if base.get("F"):
            # Legacy DBs stored SCOTUS under court_type 'F'
            scotus_legacy = conn.execute(
                "SELECT COUNT(*) as c FROM cases WHERE LOWER(COALESCE(court, '')) = 'scotus' AND UPPER(COALESCE(court_type, '')) = 'F'"
            ).fetchone()["c"]
        court_counts["SCOTUS"] = base.get("SCOTUS", 0) + scotus_legacy
        court_counts["F"] = max(0, base.get("F", 0) - scotus_legacy)
        court_counts["FD"] = base.get("FD", 0)
        court_counts["FS"] = base.get("FS", 0)
    else:
        rows = conn.execute(f"SELECT {court_col} as court, COUNT(*) as cnt FROM cases GROUP BY {court_col}").fetchall()
        for r in rows:
            t = map_court_type(r["court"])
            if t in court_counts:
                court_counts[t] += r["cnt"]
    conn.close()

    # Bankruptcy (FB) intentionally excluded
    return jsonify([{**d, "count": court_counts[d["value"]]} for d in court_defs])

@app.route("/api/search")
def search():
    if not os.path.exists(DB_PATH):
        return jsonify({"total": 0, "page": 1, "page_size": 20, "results": []})

    q = request.args.get("q", "").strip()
    # scope: title = case name (and citations), text = opinion body, both = everything (title matches rank first)
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

    conn = get_db()
    cols = [col[1] for col in conn.execute("PRAGMA table_info(cases)").fetchall()]

    name_col = "name" if "name" in cols else ("case_name" if "case_name" in cols else cols[1])
    date_col = "date" if "date" in cols else ("date_filed" if "date_filed" in cols else "date")
    text_col = "text" if "text" in cols else ("plain_text" if "plain_text" in cols else "content")
    court_col = "court" if "court" in cols else "court_id"
    cite_col = "citations" if "citations" in cols else None
    cite_cnt_col = "citation_count" if "citation_count" in cols else None
    ctype_col = "court_type" if "court_type" in cols else None

    conditions = []
    params = []

    # Detect FTS5 index and which columns it actually has
    has_fts = False
    fts_cols = []
    fts_text_idx = 3
    try:
        fts_row = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='cases_fts'").fetchone()
        if fts_row:
            fts_cols = [r[1] for r in conn.execute("PRAGMA table_info(cases_fts)").fetchall()]
            has_fts = bool(fts_cols)
            if "text" in fts_cols:
                fts_text_idx = fts_cols.index("text")
    except Exception:
        has_fts = False
    fts_has_name = "name" in fts_cols
    fts_has_text = "text" in fts_cols

    fts_query = None
    words = []
    if q:
        clean_q = re.sub(r'[^a-zA-Z0-9\s"]', ' ', q).strip()
        words = [w for w in clean_q.split() if w]

        if has_fts and words:
            if scope == "title" and fts_has_name:
                fts_query = build_fts_query(words, "name")
            elif scope == "text" and fts_has_text:
                fts_query = build_fts_query(words, "text")
            elif scope == "both":
                fts_query = build_fts_query(words, None)

        if fts_query:
            if scope == "title":
                # Case name via FTS; also match the raw citation string (citations are not in the FTS index)
                cite_cond = f" OR {cite_col} LIKE ?" if cite_col else ""
                conditions.append(f"(rowid IN (SELECT rowid FROM cases_fts WHERE cases_fts MATCH ?){cite_cond})")
                params.append(fts_query)
                if cite_col:
                    params.append(f"%{q}%")
            elif scope == "text":
                conditions.append("rowid IN (SELECT rowid FROM cases_fts WHERE cases_fts MATCH ?)")
                params.append(fts_query)
            else:  # both
                cite_cond = f" OR {cite_col} LIKE ?" if cite_col else ""
                conditions.append(f"(rowid IN (SELECT rowid FROM cases_fts WHERE cases_fts MATCH ?){cite_cond})")
                params.append(fts_query)
                if cite_col:
                    params.append(f"%{q}%")
        else:
            # LIKE fallback (no usable FTS index)
            if scope == "title":
                cond = f"{name_col} LIKE ?"
                params.append(f"%{q}%")
                if cite_col:
                    cond += f" OR {cite_col} LIKE ?"
                    params.append(f"%{q}%")
                conditions.append(f"({cond})")
            elif scope == "text":
                conditions.append(f"{text_col} LIKE ?")
                params.append(f"%{q}%")
            else:
                cond = f"{name_col} LIKE ? OR {text_col} LIKE ?"
                params.extend([f"%{q}%", f"%{q}%"])
                if cite_col:
                    cond += f" OR {cite_col} LIKE ?"
                    params.append(f"%{q}%")
                conditions.append(f"({cond})")

    # Court type filter (single value or comma-separated, e.g. SCOTUS or F,FD)
    court_filter = [c.strip().upper() for c in court_type.split(",") if c.strip()]
    if court_filter:
        or_parts = []
        if ctype_col:
            for ct in court_filter:
                if ct == "SCOTUS":
                    or_parts.append(f"(UPPER({ctype_col}) = 'SCOTUS' OR LOWER({court_col}) = 'scotus')")
                elif ct == "F":
                    or_parts.append(f"(UPPER({ctype_col}) = 'F' AND LOWER({court_col}) <> 'scotus')")
                else:
                    or_parts.append(f"UPPER({ctype_col}) = ?")
                    params.append(ct)
        else:
            # Legacy DB without court_type column: derive from court id
            appellate_ids = ",".join([f"'{c}'" for c in ["ca1", "ca2", "ca3", "ca4", "ca5", "ca6", "ca7", "ca8", "ca9", "ca10", "ca11", "cadc", "cafc"]])
            for ct in court_filter:
                if ct == "SCOTUS":
                    or_parts.append(f"LOWER({court_col}) = 'scotus'")
                elif ct == "F":
                    or_parts.append(f"LOWER({court_col}) IN ({appellate_ids})")
                elif ct == "FB":
                    or_parts.append(f"(LOWER({court_col}) LIKE '%bankr%' OR SUBSTR(LOWER({court_col}), -1) = 'b')")
                else:
                    or_parts.append("1=0")
        conditions.append("(" + " OR ".join(or_parts) + ")")

    # Bankruptcy cases are excluded from all results
    if ctype_col:
        conditions.append(f"UPPER(COALESCE({ctype_col}, '')) <> 'FB'")

    if year_from:
        conditions.append(f"SUBSTR({date_col}, 1, 4) >= ?")
        params.append(year_from)

    if year_to:
        conditions.append(f"SUBSTR({date_col}, 1, 4) <= ?")
        params.append(year_to)

    where_sql = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    # Total count
    count_query = f"SELECT COUNT(*) as total FROM cases {where_sql}"
    total = conn.execute(count_query, params).fetchone()["total"]

    # Title matches rank first when searching everything; otherwise newest first
    rank_sql = ""
    rank_params = []
    if q and scope == "both":
        rank_sql = f"CASE WHEN {name_col} LIKE ? THEN 0 ELSE 1 END, "
        rank_params.append(f"%{q}%")

    offset = (page - 1) * page_size
    select_cols = [f"id, {name_col} as case_name, {court_col} as court, {date_col} as date_filed"]
    if ctype_col:
        select_cols.append(f"{ctype_col} as court_type")
    if cite_col:
        select_cols.append(f"{cite_col} as citations")
    if cite_cnt_col:
        select_cols.append(f"{cite_cnt_col} as citation_count")

    select_query = f"""
        SELECT {', '.join(select_cols)}
        FROM cases {where_sql}
        ORDER BY {rank_sql}{date_col} DESC
        LIMIT ? OFFSET ?
    """
    rows = conn.execute(select_query, params + rank_params + [page_size, offset]).fetchall()

    # Text snippets for text/both scopes (FTS only): show the matched passage
    snippets = {}
    if rows and q and scope in ("text", "both") and has_fts and fts_has_text and fts_query:
        try:
            ids = [r["id"] for r in rows]
            id_placeholders = ",".join(["?"] * len(ids))
            snip_rows = conn.execute(
                f"""SELECT c.id as cid, snippet(cases_fts, {fts_text_idx}, '', '', '…', 24) as snip
                    FROM cases_fts
                    JOIN cases c ON c.rowid = cases_fts.rowid
                    WHERE cases_fts MATCH ? AND c.id IN ({id_placeholders})""",
                [fts_query] + ids,
            ).fetchall()
            for sr in snip_rows:
                snippets[sr["cid"]] = re.sub(r"\s+", " ", sr["snip"]).strip()
        except Exception:
            snippets = {}

    conn.close()

    results = []
    for r in rows:
        court_str = r["court"]
        stored_type = r["court_type"] if (ctype_col and "court_type" in r.keys()) else None
        if stored_type:
            stored_type = str(stored_type).upper()
            if stored_type == "F" and (court_str or "").lower() == "scotus":
                stored_type = "SCOTUS"
        c_type = stored_type or map_court_type(court_str)
        raw_cites = r["citations"] if cite_col else []
        cites = format_citations(raw_cites)

        item = {
            "id": r["id"],
            "case_name": r["case_name"] or "Unknown Case",
            "court": court_str or "Federal Court",
            "court_type": c_type,
            "date_filed": str(r["date_filed"] or "")[:10],
            "citations": cites,
            "citation_count": r["citation_count"] if cite_cnt_col else 0
        }
        if r["id"] in snippets:
            item["snippet"] = snippets[r["id"]]
        results.append(item)

    return jsonify({
        "total": total,
        "page": page,
        "page_size": page_size,
        "results": results
    })

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
