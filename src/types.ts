export interface CaseRecord {
  id: string | number;
  case_name: string;
  case_name_full?: string;
  court: string;
  court_type: string;
  jurisdiction?: string;
  date_filed: string;
  citations: string[];
  citation_count?: number;
  status?: string;
  text: string;
}

export interface SearchResultItem {
  id: string | number;
  case_name: string;
  court: string;
  court_type: string;
  date_filed: string;
  citations: string[];
  citation_count?: number;
  snippet?: string;
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
  count?: number;
}

export interface FeaturesResponse {
  semantic: boolean;
}
