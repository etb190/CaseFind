import { SearchResponse, CourtOption, searchCases, getCaseById, getCourts } from '../data/searchLogic';
import { CaseRecord } from '../data/cases';

export interface SearchQueryParams {
  q?: string;
  court_type?: string;
  year_from?: string | number;
  year_to?: string | number;
  page?: string | number;
}

export async function fetchSearch(params: SearchQueryParams): Promise<SearchResponse> {
  const searchParams = new URLSearchParams();
  if (params.q !== undefined && params.q !== '') {
    searchParams.set('q', params.q);
  }
  if (params.court_type) {
    searchParams.set('court_type', params.court_type);
  }
  if (params.year_from) {
    searchParams.set('year_from', String(params.year_from));
  }
  if (params.year_to) {
    searchParams.set('year_to', String(params.year_to));
  }
  if (params.page) {
    searchParams.set('page', String(params.page));
  }

  const url = `/api/search?${searchParams.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const data = await res.json();
    return data as SearchResponse;
  } catch (err) {
    // If running in purely static environment or dev without backend running, fallback gracefully
    console.warn(`Direct fetch to ${url} encountered issue, using internal logic fallback:`, err);
    return searchCases(params);
  }
}

export async function fetchCase(id: string): Promise<CaseRecord> {
  const url = `/api/case/${encodeURIComponent(id)}`;

  try {
    const res = await fetch(url);
    if (res.status === 404) {
      throw new Error('Case not found');
    }
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const data = await res.json();
    return data as CaseRecord;
  } catch (err: any) {
    if (err?.message === 'Case not found') {
      throw err;
    }
    console.warn(`Direct fetch to ${url} encountered issue, using fallback:`, err);
    const item = getCaseById(id);
    if (!item) {
      throw new Error('Case not found');
    }
    return item;
  }
}

export async function fetchCourts(): Promise<CourtOption[]> {
  const url = '/api/courts';

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const data = await res.json();
    return data as CourtOption[];
  } catch (err) {
    console.warn(`Direct fetch to ${url} encountered issue, using fallback:`, err);
    return getCourts();
  }
}
