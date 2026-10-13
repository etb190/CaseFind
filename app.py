import os
import sys
import sqlite3
import json
import subprocess
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder="dist")

# ngrok Auth Token
NGROK_AUTH_TOKEN = "3KFi44ps2pXYBx4QavTJzyypC7q_rzRMppJXteo4SVz2ob3L"

# Path to SQLite database (checks ~/cases.db first, then ./cases.db)
default_db = os.path.expanduser("~/cases.db") if os.path.exists(os.path.expanduser("~/cases.db")) else "cases.db"
DB_PATH = os.environ.get("DB_PATH", default_db)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def map_court_type(court_str):
    court_lower = (court_str or "").lower()
    if any(c in court_lower for c in ["scotus", "ca1", "ca2", "ca3", "ca4", "ca5", "ca6", "ca7", "ca8", "ca9", "ca10", "ca11", "cadc", "cafc", "appeals"]):
        return "F"
    elif "bankr" in court_lower or "fb" in court_lower:
        return "FB"
    elif any(c in court_lower for c in ["claim", "trade", "tax", "fs"]):
        return "FS"
    return "FD"

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
    if not os.path.exists(DB_PATH):
        return jsonify([
            {"value": "F", "label": "Appeals & Supreme Court", "count": 0},
            {"value": "FD", "label": "District Courts", "count": 0},
            {"value": "FB", "label": "Bankruptcy Courts", "count": 0},
            {"value": "FS", "label": "Special Jurisdiction", "count": 0},
        ])

    conn = get_db()
    cols = [col[1] for col in conn.execute("PRAGMA table_info(cases)").fetchall()]
    court_col = "court" if "court" in cols else "court_id"

    rows = conn.execute(f"SELECT {court_col}, COUNT(*) as cnt FROM cases GROUP BY {court_col}").fetchall()
    conn.close()

    court_counts = {"F": 0, "FD": 0, "FB": 0, "FS": 0}
    for r in rows:
        c_type = map_court_type(r[court_col])
        court_counts[c_type] += r["cnt"]

    return jsonify([
        {"value": "F", "label": "Appeals & Supreme Court", "count": court_counts["F"]},
        {"value": "FD", "label": "District Courts", "count": court_counts["FD"]},
        {"value": "FB", "label": "Bankruptcy Courts", "count": court_counts["FB"]},
        {"value": "FS", "label": "Special Jurisdiction", "count": court_counts["FS"]},
    ])

@app.route("/api/search")
def search():
    if not os.path.exists(DB_PATH):
        return jsonify({"total": 0, "page": 1, "page_size": 20, "results": []})

    q = request.args.get("q", "").strip()
    court_type = request.args.get("court_type", "").strip()
    year_from = request.args.get("year_from", "").strip()
    year_to = request.args.get("year_to", "").strip()
    page = int(request.args.get("page", 1))
    page_size = 20

    conn = get_db()
    cols = [col[1] for col in conn.execute("PRAGMA table_info(cases)").fetchall()]

    name_col = "name" if "name" in cols else ("case_name" if "case_name" in cols else cols[1])
    date_col = "date" if "date" in cols else ("date_filed" if "date_filed" in cols else "date")
    text_col = "text" if "text" in cols else ("plain_text" if "plain_text" in cols else "content")
    court_col = "court" if "court" in cols else "court_id"
    cite_col = "citations" if "citations" in cols else None
    cite_cnt_col = "citation_count" if "citation_count" in cols else None

    conditions = []
    params = []

    # Check for FTS5 full-text table
    has_fts = False
    try:
        fts_check = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='cases_fts'").fetchone()
        has_fts = bool(fts_check)
    except Exception:
        has_fts = False

    if q:
        clean_q = re.sub(r'[^a-zA-Z0-9\s"]', ' ', q).strip()
        if has_fts and clean_q:
            # FTS5 fast full-text search
            fts_query = " ".join([f'"{w}"' for w in clean_q.split() if w])
            conditions.append(f"rowid IN (SELECT rowid FROM cases_fts WHERE cases_fts MATCH ?)")
            params.append(fts_query)
        else:
            conditions.append(f"({name_col} LIKE ? OR {text_col} LIKE ?)")
            params.extend([f"%{q}%", f"%{q}%"])

    court_filter = [c.strip().upper() for c in court_type.split(",") if c.strip()]
    if court_filter and "court_type" in cols:
        placeholders = ",".join(["?"] * len(court_filter))
        conditions.append(f"court_type IN ({placeholders})")
        params.extend(court_filter)

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

    # Paginated results
    offset = (page - 1) * page_size
    select_query = f"""
        SELECT id, {name_col} as case_name, {court_col} as court, {date_col} as date_filed
        {f", {cite_col} as citations" if cite_col else ""}
        {f", {cite_cnt_col} as citation_count" if cite_cnt_col else ""}
        FROM cases {where_sql}
        ORDER BY {date_col} DESC
        LIMIT ? OFFSET ?
    """
    rows = conn.execute(select_query, params + [page_size, offset]).fetchall()
    conn.close()

    results = []
    for r in rows:
        c_type = map_court_type(r["court"])
        raw_cites = r["citations"] if cite_col else []
        cites = format_citations(raw_cites)

        results.append({
            "id": r["id"],
            "case_name": r["case_name"] or "Unknown Case",
            "court": r["court"] or "Federal Court",
            "court_type": c_type,
            "date_filed": str(r["date_filed"] or "")[:10],
            "citations": cites,
            "citation_count": r["citation_count"] if cite_cnt_col else 0
        })

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

    return jsonify({
        "id": row["id"],
        "case_name": row[name_col] or "Unknown Case",
        "case_name_full": row[full_name_col] or row[name_col],
        "court": row[court_col] or "Federal Court",
        "court_type": map_court_type(row[court_col]),
        "jurisdiction": row[jurisdiction_col] if jurisdiction_col else "US Federal",
        "date_filed": str(row[date_col] or "")[:10],
        "citations": cites,
        "citation_count": row[cite_cnt_col] if cite_cnt_col else 0,
        "status": "Precedential",
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
