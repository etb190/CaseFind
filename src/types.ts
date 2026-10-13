export type CourtTypeCode = 'F' | 'FD' | 'FB' | 'FS';

export interface CaseRecord {
  id: string;
  case_name: string;
  case_name_full: string;
  court: string;
  court_type: CourtTypeCode;
  jurisdiction: string;
  date_filed: string; // YYYY-MM-DD
  citations: string[];
  citation_count: number;
  status: string;
  text: string;
}

export interface SearchResultItem {
  id: string;
  case_name: string;
  court: string;
  court_type: CourtTypeCode;
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
  value: CourtTypeCode | string;
  label: string;
  count: number;
}
