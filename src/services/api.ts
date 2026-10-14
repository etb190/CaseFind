import { SearchResponse, CaseRecord, CourtOption, FeaturesResponse } from "../types";

export interface SearchQueryParams {
  q?: string;
  scope?: "title" | "text" | "both";
  court_type?: string;
  year_from?: string | number;
  year_to?: string | number;
  page?: string | number;
  mode?: "keyword" | "concept";
}

const SERVER_ERROR_MESSAGE = "Couldn't reach the server. Try again.";
const DEFAULT_HEADERS: Record<string, string> = {
  "Accept": "application/json",
  "ngrok-skip-browser-warning": "true",
};
const FETCH_TIMEOUT_MS = 15000;

function buildSearchParams(params: SearchQueryParams): string {
  const searchParams = new URLSearchParams();
  if (params.q !== undefined && params.q !== "") {
    searchParams.set("q", params.q);
  }
  if (params.scope) {
    searchParams.set("scope", params.scope);
  }
  if (params.court_type) {
    searchParams.set("court_type", params.court_type);
  }
  if (params.year_from) {
    searchParams.set("year_from", String(params.year_from));
  }
  if (params.year_to) {
    searchParams.set("year_to", String(params.year_to));
  }
  if (params.page) {
    searchParams.set("page", String(params.page));
  }
  return searchParams.toString();
}

async function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
    });
    return res;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Search request timed out. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

export async function fetchSearch(
  params: SearchQueryParams,
  isConcept = false
): Promise<SearchResponse> {
  const queryString = buildSearchParams(params);
  const endpoint = isConcept ? "/api/semantic" : "/api/search";
  const url = queryString ? (endpoint + "?" + queryString) : endpoint;

  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      throw new Error(SERVER_ERROR_MESSAGE);
    }
    const data = await res.json();
    return data as SearchResponse;
  } catch (err: any) {
    if (err.message && err.message.includes("timed out")) {
      throw err;
    }
    throw new Error(SERVER_ERROR_MESSAGE);
  }
}

export async function fetchCase(id: string | number): Promise<CaseRecord> {
  const url = "/api/case/" + encodeURIComponent(String(id));
  try {
    const res = await fetchWithTimeout(url);
    if (res.status === 404) {
      throw new Error("Case not found");
    }
    if (!res.ok) {
      throw new Error(SERVER_ERROR_MESSAGE);
    }
    const data = await res.json();
    return data as CaseRecord;
  } catch (err: any) {
    if (err.message === "Case not found") {
      throw err;
    }
    throw new Error(SERVER_ERROR_MESSAGE);
  }
}

export async function fetchCourts(): Promise<CourtOption[]> {
  const url = "/api/courts";
  try {
    const res = await fetchWithTimeout(url, 8000);
    if (!res.ok) {
      throw new Error(SERVER_ERROR_MESSAGE);
    }
    const data = await res.json();
    return data as CourtOption[];
  } catch {
    throw new Error(SERVER_ERROR_MESSAGE);
  }
}

export async function fetchFeatures(): Promise<FeaturesResponse> {
  const url = "/api/features";
  try {
    const res = await fetchWithTimeout(url, 5000);
    if (!res.ok) {
      return { semantic: false };
    }
    const data = await res.json();
    return { semantic: Boolean(data?.semantic) };
  } catch {
    return { semantic: false };
  }
}
