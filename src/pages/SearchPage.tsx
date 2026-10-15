import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from '../context/RouterContext';
import { fetchSearch, fetchCourts, fetchFeatures } from '../services/api';
import { SearchResponse, SearchResultItem, CourtOption } from '../types';
import { CourtSelect, ScopeSelect, COURT_TYPE_LABELS, SearchScope } from '../components/Filters';
import { Search, ChevronLeft, ChevronRight, AlertCircle, RefreshCw, Scale, ArrowUpRight, Sparkles } from 'lucide-react';

const DEFAULT_COURT_OPTIONS: CourtOption[] = [
  { value: 'SCOTUS', label: 'Supreme Court' },
  { value: 'F', label: 'Appeals Courts' },
  { value: 'FD', label: 'District Courts' },
  { value: 'FS', label: 'Special Jurisdiction' },
];

export const SearchPage: React.FC = () => {
  const { searchParams, navigate } = useRouter();

  const q = searchParams.get('q') ?? '';
  const courtTypeParam = searchParams.get('court_type') ?? '';
  const scopeParam = (['title', 'text', 'both'].includes(searchParams.get('scope') ?? '')
    ? searchParams.get('scope')
    : 'title') as SearchScope;
  const yearFromParam = searchParams.get('year_from') ?? '';
  const yearToParam = searchParams.get('year_to') ?? '';
  const pageParam = parseInt(searchParams.get('page') ?? '1', 10) || 1;
  const modeParam = (searchParams.get('mode') === 'concept' ? 'concept' : 'keyword') as 'keyword' | 'concept';

  const [inputQuery, setInputQuery] = useState(q);
  const [selectedCourt, setSelectedCourt] = useState<string>(
    courtTypeParam ? courtTypeParam.split(',')[0] : ''
  );
  const [scope, setScope] = useState<SearchScope>(scopeParam);
  const [yearFrom, setYearFrom] = useState(yearFromParam);
  const [yearTo, setYearTo] = useState(yearToParam);
  const [searchMode, setSearchMode] = useState<'keyword' | 'concept'>(modeParam);
  const [semanticSupported, setSemanticSupported] = useState(false);

  const [courts, setCourts] = useState<CourtOption[]>(DEFAULT_COURT_OPTIONS);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync state with URL query parameters
  useEffect(() => {
    setInputQuery(q);
    setSelectedCourt(courtTypeParam ? courtTypeParam.split(',')[0] : '');
    setScope(scopeParam);
    setYearFrom(yearFromParam);
    setYearTo(yearToParam);
    setSearchMode(modeParam);
  }, [q, courtTypeParam, scopeParam, yearFromParam, yearToParam, modeParam]);

  // Check features (e.g. semantic concept search support)
  useEffect(() => {
    let mounted = true;
    fetchFeatures()
      .then((res) => {
        if (mounted) {
          setSemanticSupported(Boolean(res?.semantic));
        }
      })
      .catch(() => {
        if (mounted) setSemanticSupported(false);
      });

    fetchCourts()
      .then((res) => {
        if (mounted && res && res.length > 0) {
          setCourts(res);
        }
      })
      .catch(() => {
        // Keep default court labels
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch search results
  const loadResults = useCallback(() => {
    setIsLoading(true);
    setError(null);

    const isConcept = searchMode === 'concept' && semanticSupported;

    fetchSearch(
      {
        q,
        scope: scopeParam,
        court_type: courtTypeParam,
        year_from: yearFromParam,
        year_to: yearToParam,
        page: pageParam,
      },
      isConcept
    )
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch((err: any) => {
        // Drop the previous result set so the header never shows a stale
        // count (e.g. the browse total) alongside the error card.
        setData(null);
        setError(err.message || "Couldn't reach the server. Try again.");
        setIsLoading(false);
      });
  }, [q, scopeParam, courtTypeParam, yearFromParam, yearToParam, pageParam, searchMode, semanticSupported]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  // Update URL search params
  const updateSearchUrl = (updates: {
    q?: string;
    court?: string;
    scope?: SearchScope;
    yearFrom?: string;
    yearTo?: string;
    page?: number;
    mode?: 'keyword' | 'concept';
  }) => {
    const params = new URLSearchParams();

    const newQ = updates.q !== undefined ? updates.q : q;
    if (newQ.trim()) {
      params.set('q', newQ.trim());
    }

    const newScope = updates.scope !== undefined ? updates.scope : scope;
    params.set('scope', newScope);

    const newCourt = updates.court !== undefined ? updates.court : selectedCourt;
    if (newCourt) {
      params.set('court_type', newCourt);
    }

    const newYearFrom = updates.yearFrom !== undefined ? updates.yearFrom : yearFrom;
    if (newYearFrom.trim()) {
      params.set('year_from', newYearFrom.trim());
    }

    const newYearTo = updates.yearTo !== undefined ? updates.yearTo : yearTo;
    if (newYearTo.trim()) {
      params.set('year_to', newYearTo.trim());
    }

    const newMode = updates.mode !== undefined ? updates.mode : searchMode;
    if (newMode === 'concept' && semanticSupported) {
      params.set('mode', 'concept');
    }

    const newPage = updates.page !== undefined ? updates.page : 1;
    if (newPage > 1) {
      params.set('page', String(newPage));
    }

    navigate(`/search?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim() === q.trim()) {
      loadResults();
    } else {
      updateSearchUrl({ q: inputQuery, page: 1 });
    }
  };

  const handleCourtChange = (code: string) => {
    setSelectedCourt(code);
    updateSearchUrl({ court: code, page: 1 });
  };

  const handleScopeChange = (s: SearchScope) => {
    setScope(s);
    updateSearchUrl({ scope: s, page: 1 });
  };

  const handleApplyYearFilter = () => {
    updateSearchUrl({ yearFrom, yearTo, page: 1 });
  };

  const handleResetFilters = () => {
    setSelectedCourt('');
    setYearFrom('');
    setYearTo('');
    updateSearchUrl({ court: '', yearFrom: '', yearTo: '', page: 1 });
  };

  const handleModeChange = (mode: 'keyword' | 'concept') => {
    setSearchMode(mode);
    updateSearchUrl({ mode, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    updateSearchUrl({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;
  const isBrowsingAll = !q.trim();

  return (
    <div className="min-h-screen bg-stone-50/40 dark:bg-stone-950 transition-colors py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Search Controls Bar */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 mb-6 shadow-2xs">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Search by case name or citation, e.g. Miranda v. Arizona or 410 U.S. 113"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-sm font-interface placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-sm font-medium font-interface rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                Search
              </button>
              {inputQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setInputQuery('');
                    updateSearchUrl({ q: '', page: 1 });
                  }}
                  className="px-3 py-2.5 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-interface cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Active Filters Row & Concept Switch */}
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs font-interface">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-stone-400 dark:text-stone-500 font-medium mr-1">Court:</span>
              <CourtSelect
                courts={courts}
                value={selectedCourt}
                onChange={handleCourtChange}
                className="w-52"
              />
              <span className="text-stone-400 dark:text-stone-500 font-medium mr-1 ml-2">Search in:</span>
              <ScopeSelect value={scope} onChange={handleScopeChange} />
            </div>

            {/* Year Inputs and Semantic Concept Switch */}
            <div className="flex flex-wrap items-center gap-3">
              {semanticSupported && (
                <div className="inline-flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <button
                    type="button"
                    onClick={() => handleModeChange('keyword')}
                    className={`px-2.5 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                      searchMode === 'keyword'
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium shadow-xs'
                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    Keyword
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange('concept')}
                    className={`px-2.5 py-0.5 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                      searchMode === 'concept'
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium shadow-xs'
                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Concept</span>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-stone-400 dark:text-stone-500 font-medium">Years:</span>
                <input
                  type="number"
                  placeholder="From"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  onBlur={handleApplyYearFilter}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyYearFilter()}
                  className="w-18 px-2 py-1 rounded border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-xs text-stone-900 dark:text-stone-100 font-interface focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
                <span className="text-stone-400">–</span>
                <input
                  type="number"
                  placeholder="To"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  onBlur={handleApplyYearFilter}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyYearFilter()}
                  className="w-18 px-2 py-1 rounded border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-xs text-stone-900 dark:text-stone-100 font-interface focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
                {(selectedCourt || yearFrom || yearTo) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="ml-1 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Header: Total Count */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-stone-600 dark:text-stone-400 font-interface">
            {isLoading ? (
              <span>Searching federal opinions...</span>
            ) : data ? (
              <span>
                {isBrowsingAll ? (
                  <>Browsing <strong className="text-stone-900 dark:text-stone-100 font-semibold">{data.total}</strong> total cases</>
                ) : (
                  <>Found <strong className="text-stone-900 dark:text-stone-100 font-semibold">{data.total}</strong> cases matching &ldquo;{q}&rdquo;</>
                )}
                {data.total > 0 && (
                  <span className="text-stone-400 ml-2">
                    (Page {data.page} of {totalPages})
                  </span>
                )}
              </span>
            ) : null}
          </div>
        </div>

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 animate-pulse"
              >
                <div className="h-5 bg-stone-200 dark:bg-stone-800 rounded w-2/5 mb-3" />
                <div className="h-4 bg-stone-100 dark:bg-stone-800/60 rounded w-1/3 mb-2" />
                <div className="h-3 bg-stone-100 dark:bg-stone-800/40 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State: Clear error message as requested */}
        {!isLoading && error && (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-rose-200 dark:border-rose-900/40 p-8 text-center my-6">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 font-interface mb-1">
              Couldn&apos;t reach the server. Try again.
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto font-interface mb-4">
              {error}
            </p>
            <button
              onClick={loadResults}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-medium font-interface rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Search</span>
            </button>
          </div>
        )}

        {/* Empty Results State */}
        {!isLoading && !error && data && data.results.length === 0 && (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-10 text-center my-6">
            <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 mx-auto flex items-center justify-center mb-3">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 font-interface mb-1">
              No federal court opinions found
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto font-interface mb-4">
              We couldn&apos;t find any opinions matching your search criteria. Try broadening your keywords or clearing filters.
            </p>
            {selectedCourt && (
              <p className="text-xs text-amber-700 dark:text-amber-400 font-interface mb-5 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/40 max-w-md mx-auto">
                Filter is active for <strong>{COURT_TYPE_LABELS[selectedCourt] ?? selectedCourt}</strong>. Landmark Supreme Court decisions and other jurisdictions will not appear under this filter.
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-3">
              {selectedCourt && (
                <button
                  onClick={() => {
                    setSelectedCourt('');
                    updateSearchUrl({ court: '', page: 1 });
                  }}
                  className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-medium font-interface rounded-lg transition-colors cursor-pointer"
                >
                  Search All Courts
                </button>
              )}
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium font-interface rounded-lg transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
              <button
                onClick={() => updateSearchUrl({ q: '', court: '', yearFrom: '', yearTo: '', page: 1 })}
                className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-medium font-interface rounded-lg transition-colors cursor-pointer"
              >
                Browse all opinions
              </button>
            </div>
          </div>
        )}

        {/* Results List */}
        {!isLoading && !error && data && data.results.length > 0 && (
          <div className="space-y-3.5">
            {data.results.map((c: SearchResultItem) => (
              <article
                key={String(c.id)}
                className="group bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 hover:border-stone-400 dark:hover:border-stone-600 transition-all shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    
                    {/* Case Name Link - ID treated as opaque value */}
                    <h2 className="text-lg sm:text-xl font-semibold text-stone-900 dark:text-stone-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 font-interface transition-colors mb-2">
                      <button
                        onClick={() => navigate(`/case/${encodeURIComponent(String(c.id))}`)}
                        className="text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded-sm inline-flex items-baseline gap-1"
                      >
                        <span>{c.case_name}</span>
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity inline shrink-0 text-stone-400" />
                      </button>
                    </h2>

                    {/* Concept Snippet if present */}
                    {c.snippet && (
                      <p className="text-sm text-stone-600 dark:text-stone-300 font-opinion italic mb-3 leading-relaxed bg-stone-50 dark:bg-stone-800/40 p-2.5 rounded-lg border border-stone-100 dark:border-stone-800">
                        &ldquo;{c.snippet}&rdquo;
                      </p>
                    )}

                    {/* Metadata Strip: Clean unboxed metadata with typographic separators */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500 dark:text-stone-400 font-interface mb-3">
                      <span className="font-medium text-stone-700 dark:text-stone-300">
                        {c.court}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Filed {c.date_filed}
                      </span>
                      {c.court_type && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-stone-600 dark:text-stone-300">
                            {COURT_TYPE_LABELS[c.court_type] ?? c.court_type}
                          </span>
                        </>
                      )}
                      {c.citation_count !== undefined && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-stone-700 dark:text-stone-300 font-medium tabular-nums">
                            Cited by {c.citation_count}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Citations list */}
                    {c.citations && c.citations.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 font-code">
                        <span className="text-stone-400 dark:text-stone-500 font-interface text-[11px] mr-1">
                          Citations:
                        </span>
                        {c.citations.map((cite, cIdx) => (
                          <span
                            key={cIdx}
                            className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded text-[11px] text-stone-700 dark:text-stone-300"
                          >
                            {cite}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Read opinion button */}
                  <div className="hidden sm:block shrink-0">
                    <button
                      onClick={() => navigate(`/case/${encodeURIComponent(String(c.id))}`)}
                      className="px-3.5 py-1.5 text-xs font-medium font-interface rounded-lg border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      Read Opinion
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination Section */}
        {!isLoading && !error && data && data.total > data.page_size && (
          <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <button
              onClick={() => handlePageChange(data.page - 1)}
              disabled={data.page <= 1}
              className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium font-interface border transition-colors ${
                data.page <= 1
                  ? 'border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed bg-stone-50/50 dark:bg-stone-900/50'
                  : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer bg-white dark:bg-stone-900'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Page</span>
            </button>

            <span className="text-xs text-stone-500 dark:text-stone-400 font-interface tabular-nums">
              Page {data.page} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(data.page + 1)}
              disabled={data.page >= totalPages}
              className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium font-interface border transition-colors ${
                data.page >= totalPages
                  ? 'border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed bg-stone-50/50 dark:bg-stone-900/50'
                  : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer bg-white dark:bg-stone-900'
              }`}
            >
              <span>Next Page</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
