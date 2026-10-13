# JurisSearch — U.S. Federal Court Legal Research

JurisSearch is a clean, fast legal research single-page application for searching and reading United States federal court opinions across the Supreme Court, Circuit Courts of Appeals, District Courts, Bankruptcy Courts, and Special Jurisdiction Courts.

## Features

- **Home Page (`/`)**: Centered search box with exact query support (`Miranda v. Arizona`, `410 U.S. 113`, `Chevron v. NRDC`), court type filters (Appeals, District, Bankruptcy, Special), and year range filters.
- **Search Results (`/search`)**: Real-time filtering and browsing of all federal opinions with total match counts, court badges, filing dates, official citation lists, and previous/next page controls (page size fixed at 20).
- **Case Reading Page (`/case/<id>`)**: Comfortable 70-character reading column (`max-w-[70ch]`), high-legibility serif typography (`Source Serif 4`), preserved judicial paragraph structures, reading progress bar, "Copy Citation" button (Bluebook format), and dedicated print mode.
- **Dark Mode**: Light/Dark theme toggle with automatic persistence and smooth transitions.
- **Full-Stack API & Static SPA Dual Support**: Relative API requests (`/api/search`, `/api/case/<id>`, `/api/courts`) backed by Express with full static fallback for pure static hostings.

---

## Build & Run Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
Runs the full-stack Express server with Vite middleware on port 3000:
```bash
npm run dev
```

### 3. Production Build
Compiles the static single-page application into the `dist/` directory:
```bash
npm run build
```

### 4. Production Start (Full-Stack)
Starts the Express server in production mode serving API routes and static `dist/` files:
```bash
npm start
```

### 5. Preview Static Build
Previews the built static SPA using Vite's static preview server:
```bash
npm run preview
```

---

## Backend API Specification

All API endpoints use same-origin relative URLs (`/api/...`):

### 1. `GET /api/search?q=&court_type=&year_from=&year_to=&page=`
- **Query Parameters**:
  - `q`: Case name, citation, or legal term (may be empty to browse all cases).
  - `court_type`: Comma-separated court codes:
    - `F`: U.S. Courts of Appeals & Supreme Court
    - `FD`: U.S. District Courts
    - `FB`: U.S. Bankruptcy Courts
    - `FS`: Special Jurisdiction Courts (Court of Federal Claims, Court of International Trade, U.S. Tax Court)
  - `year_from` / `year_to`: 4-digit years (e.g. `1960`, `2024`).
  - `page`: 1-based page number (page size is fixed at 20).
- **Response Format**:
  ```json
  {
    "total": 31,
    "page": 1,
    "page_size": 20,
    "results": [
      {
        "id": "miranda-v-arizona",
        "case_name": "Miranda v. Arizona",
        "court": "Supreme Court of the United States",
        "court_type": "F",
        "date_filed": "1966-06-13",
        "citations": ["384 U.S. 436", "86 S. Ct. 1602", "16 L. Ed. 2d 694"],
        "citation_count": 3
      }
    ]
  }
  ```

### 2. `GET /api/case/<id>`
- **Response Format**:
  ```json
  {
    "id": "miranda-v-arizona",
    "case_name": "Miranda v. Arizona",
    "case_name_full": "Ernesto A. Miranda, Petitioner, v. State of Arizona",
    "court": "Supreme Court of the United States",
    "court_type": "F",
    "jurisdiction": "US Federal",
    "date_filed": "1966-06-13",
    "citations": ["384 U.S. 436", "86 S. Ct. 1602", "16 L. Ed. 2d 694"],
    "citation_count": 3,
    "status": "Precedential",
    "text": "MR. CHIEF JUSTICE WARREN delivered the opinion of the Court..."
  }
  ```
  *(Returns HTTP 404 with `{"error": "Case not found"}` if missing).*

### 3. `GET /api/courts`
- **Response Format**:
  ```json
  [
    { "value": "F", "label": "U.S. Courts of Appeals & Supreme Court", "count": 19 },
    { "value": "FD", "label": "U.S. District Courts", "count": 4 },
    { "value": "FB", "label": "U.S. Bankruptcy Courts", "count": 4 },
    { "value": "FS", "label": "Special Jurisdiction Courts", "count": 4 }
  ]
  ```

---

## Typography & Design Standards

- **UI & Controls**: `Plus Jakarta Sans` for crisp interface legibility.
- **Opinion Body**: `Source Serif 4` set in an editorial column of ~70 characters (`max-w-[72ch]`) with relaxed leading (`1.85`).
- **Citations & Docket Numbers**: `JetBrains Mono` and tabular numerals.
- **Print**: Dedicated `@media print` rules hiding interactive UI bars while preserving case headings, citations, and full opinion text for court briefs and paper reading.
