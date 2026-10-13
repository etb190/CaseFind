import { CASES_DATABASE, COURT_TYPE_LABELS, CaseRecord } from './cases';

export interface SearchResultItem {
  id: string;
  case_name: string;
  court: string;
  court_type: 'F' | 'FD' | 'FB' | 'FS';
  date_filed: string;
  citations: string[];
  citation_count: number;
}

export interface SearchResponse {
  total: number;
  page: number;
  page_size: number;
  results: SearchResultItem[];
}

export interface CourtOption {
  value: string;
  label: string;
  count: number;
}

export function searchCases(params: {
  q?: string;
  court_type?: string;
  year_from?: string | number;
  year_to?: string | number;
  page?: string | number;
}): SearchResponse {
  const query = (params.q || '').trim().toLowerCase();
  const rawCourtType = (params.court_type || '').trim();
  const courtTypes = rawCourtType
    ? rawCourtType.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean)
    : [];

  const yearFrom = params.year_from ? parseInt(String(params.year_from), 10) : NaN;
  const yearTo = params.year_to ? parseInt(String(params.year_to), 10) : NaN;
  
  let page = parseInt(String(params.page || '1'), 10);
  if (isNaN(page) || page < 1) page = 1;
  const pageSize = 20;

  // Filter cases
  const filtered = CASES_DATABASE.filter((item) => {
    // 1. Text Query Filter (case name, full name, citations, or opinion text)
    if (query) {
      const nameMatch = item.case_name.toLowerCase().includes(query);
      const fullNameMatch = item.case_name_full.toLowerCase().includes(query);
      const citationMatch = item.citations.some((c) => c.toLowerCase().includes(query));
      const courtMatch = item.court.toLowerCase().includes(query);
      const textMatch = item.text.toLowerCase().includes(query);

      if (!nameMatch && !fullNameMatch && !citationMatch && !courtMatch && !textMatch) {
        return false;
      }
    }

    // 2. Court Type Filter
    if (courtTypes.length > 0) {
      if (!courtTypes.includes(item.court_type)) {
        return false;
      }
    }

    // 3. Year Range Filter
    const caseYear = parseInt(item.date_filed.slice(0, 4), 10);
    if (!isNaN(yearFrom) && caseYear < yearFrom) {
      return false;
    }
    if (!isNaN(yearTo) && caseYear > yearTo) {
      return false;
    }

    return true;
  });

  // Sort by date_filed descending by default (most recent first)
  // If query is present and matches title exactly or starts with, rank those higher
  filtered.sort((a, b) => {
    if (query) {
      const aExact = a.case_name.toLowerCase() === query ? 2 : a.case_name.toLowerCase().includes(query) ? 1 : 0;
      const bExact = b.case_name.toLowerCase() === query ? 2 : b.case_name.toLowerCase().includes(query) ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;
    }
    return new Date(b.date_filed).getTime() - new Date(a.date_filed).getTime();
  });

  const total = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  const results: SearchResultItem[] = pageItems.map((c) => ({
    id: c.id,
    case_name: c.case_name,
    court: c.court,
    court_type: c.court_type,
    date_filed: c.date_filed,
    citations: c.citations,
    citation_count: c.citation_count,
  }));

  return {
    total,
    page,
    page_size: pageSize,
    results,
  };
}

export function getCaseById(id: string): CaseRecord | undefined {
  return CASES_DATABASE.find((c) => c.id === id);
}

export function getCourts(): CourtOption[] {
  const counts: Record<string, number> = {
    F: 0,
    FD: 0,
    FB: 0,
    FS: 0,
  };

  for (const c of CASES_DATABASE) {
    if (counts[c.court_type] !== undefined) {
      counts[c.court_type]++;
    }
  }

  return [
    { value: 'F', label: COURT_TYPE_LABELS.F || 'U.S. Courts of Appeals & Supreme Court', count: counts.F },
    { value: 'FD', label: COURT_TYPE_LABELS.FD || 'U.S. District Courts', count: counts.FD },
    { value: 'FB', label: COURT_TYPE_LABELS.FB || 'U.S. Bankruptcy Courts', count: counts.FB },
    { value: 'FS', label: COURT_TYPE_LABELS.FS || 'Special Jurisdiction Courts', count: counts.FS },
  ];
}
