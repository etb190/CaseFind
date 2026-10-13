# CaseFind

CaseFind is a clean, fast legal research single-page web application for searching and reading United States federal court opinions across the Supreme Court, Circuit Courts of Appeals, District Courts, Bankruptcy Courts, and Special Jurisdiction Courts.

## Features

- **Home Page (`/`)**: Large centered search box with court type filters (Appeals, District, Bankruptcy, Special) and year range controls.
- **Search Results (`/search`)**: Real-time filtering and browsing with total count, pagination, court and filing metadata, official citations, and "Cited by N" counts.
- **Case Reading (`/case/<id>`)**: Comfortable reading column (~70 characters wide) using readable serif typography (`Source Serif 4`), preserved judicial paragraph breaks, copy citation button, and dedicated print stylesheet.
- **Concept / Semantic Search**: Optional Keyword / Concept mode switch automatically shown when the backend features endpoint (`/api/features`) reports `{ "semantic": true }`.
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

## Backend API Contract

The front end communicates with the backend via relative URLs (`/api/*`):

- `GET /api/search?q=&court_type=&year_from=&year_to=&page=`
  - Returns: `{ total, page, page_size, results: [ { id, case_name, court, court_type, date_filed, citations, citation_count } ] }`
- `GET /api/case/<id>`
  - Returns: `{ id, case_name, case_name_full, court, court_type, jurisdiction, date_filed, citations, citation_count, status, text }` (404 with `{ error }` if missing)
- `GET /api/courts`
  - Returns: `[ { value, label, count } ]`
- `GET /api/features`
  - Returns: `{ semantic: boolean }`
- `GET /api/semantic?q=&court_type=&year_from=&year_to=&page=`
  - Used when Concept search mode is active. Returns results with optional `snippet` under each case.
