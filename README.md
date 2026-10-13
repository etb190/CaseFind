# CaseFind

CaseFind is a clean, fast legal research single-page web application for searching and reading United States federal court opinions across the Supreme Court, Circuit Courts of Appeals, District Courts, and Special Jurisdiction Courts. **Bankruptcy cases are excluded** at ingestion time and filtered out of all search results.

## Features

- **Home Page (`/`)**: Large centered search box with a court dropdown (All / Supreme Court / Appeals / District / Special), search scope selector, and year range controls.
- **Search Scope (`scope`)**: Choose where to search — `Case name` (default, also matches citations), `Opinion text` (full text of the opinion), or `Title & text` (everything, with title matches ranked first).
- **Search Results (`/search`)**: Real-time filtering and browsing with total count, pagination, court and filing metadata, official citations, text snippets for content matches, and "Cited by N" counts.
- **Case Reading (`/case/<id>`)**: Comfortable reading column (~70 characters wide) using readable serif typography (`Source Serif 4`), preserved judicial paragraph breaks, copy citation button, and dedicated print stylesheet.
- **Concept / Semantic Search**: Optional Keyword / Concept mode switch automatically shown when the backend features endpoint (`/api/features`) reports `{ "semantic": true }`. No AI is used by default.
- **Theme**: Light and dark mode with persistent user preference.
- **Error Handling**: Clear error feedback (`Couldn't reach the server. Try again.`) with retry affordances when API requests fail.

---

## Build Steps & Commands

### Prerequisites
- Node.js 18+
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
Runs the Vite development server on port 3000 with proxy forwarding `/api` to `http://localhost:8001`:
```bash
npm run dev
```

### 3. Build Static Application
Compiles the static single-page application into the `dist/` directory:
```bash
npm run build
```

### 4. Preview Static Build
Serves the built files from `dist/` locally for preview:
```bash
npm run preview
```

---

## Ingesting Cases (100K+ on Lightning AI or any Linux box)

The database is plain SQLite — 100K opinions is roughly 3–6 GB including the FTS5 index, well within reach:

```bash
# On Lightning AI (or any machine with Python 3 + curl):
pip install flask
cd CaseFind

# Ingest 100,000 federal cases (bankruptcy excluded automatically):
python ingest_cases.py --limit 100000

# Useful flags:
#   --appeals-only           Only Supreme Court + Circuit Courts
#   --include-bankruptcy     Opt back in to bankruptcy courts
#   --keep-existing          Append instead of rebuilding
```

The script streams CourtListener bulk data (courts → dockets → opinion clusters → opinions), skips bankruptcy courts, stores `court_type` as `SCOTUS` / `F` / `FD` / `FS`, and finishes by building the FTS5 full-text index. Expect ~30–90 minutes for 100K cases depending on bandwidth; keep `cases.db` in the persistent home directory (`~/cases.db`) on Lightning so it survives session restarts.

Then build the frontend and launch (Flask serves both the API and the built SPA on one port):

```bash
npm install && npm run build
python app.py            # http://0.0.0.0:8001 + ngrok tunnel
```

On Lightning AI, expose port 8001 via the built-in port forwarding (or let the script's ngrok tunnel handle it). The frontend calls `/api/*` relative URLs, so no configuration is needed.

---

## Backend API Contract

The front end communicates with the backend via relative URLs (`/api/*`):

- `GET /api/search?q=&scope=&court_type=&year_from=&year_to=&page=`
  - `scope`: `title` (default — case name + citations), `text` (opinion body), `both` (title matches ranked first)
  - `court_type`: `SCOTUS`, `F` (appeals), `FD` (district), `FS` (special) — single value or comma-separated
  - Returns: `{ total, page, page_size, results: [ { id, case_name, court, court_type, date_filed, citations, citation_count, snippet? } ] }`
  - Bankruptcy cases are never returned.
- `GET /api/case/<id>`
  - Returns: `{ id, case_name, case_name_full, court, court_type, jurisdiction, date_filed, citations, citation_count, status, text }` (404 with `{ error }` if missing)
- `GET /api/courts`
  - Returns: `[ { value, label, count } ]` — Supreme Court, Appeals, District, Special Jurisdiction (bankruptcy intentionally excluded)
- `GET /api/features`
  - Returns: `{ semantic: boolean }`
- `GET /api/semantic?q=&court_type=&year_from=&year_to=&page=`
  - Used when Concept search mode is active. Returns results with optional `snippet` under each case.
