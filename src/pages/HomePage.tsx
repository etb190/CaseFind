import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { fetchCourts } from '../services/api';
import { CourtOption } from '../types';
import { Search, SlidersHorizontal, ArrowRight, BookOpen, Clock, Building2 } from 'lucide-react';

const COURT_OPTIONS_DEFAULT: CourtOption[] = [
  { value: 'F', label: 'Appeals & Supreme Court', count: 19 },
  { value: 'FD', label: 'District Courts', count: 4 },
  { value: 'FB', label: 'Bankruptcy Courts', count: 4 },
  { value: 'FS', label: 'Special Jurisdiction', count: 4 },
];

const SUGGESTED_SEARCHES = [
  { label: 'Miranda v. Arizona', query: 'Miranda v. Arizona' },
  { label: '410 U.S. 113', query: '410 U.S. 113' },
  { label: 'Chevron v. NRDC', query: 'Chevron' },
  { label: 'Citizens United', query: 'Citizens United' },
  { label: 'Brown v. Board of Education', query: 'Brown v. Board' },
  { label: 'Cell phone privacy', query: 'cell phone' },
];

export const HomePage: React.FC = () => {
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCourts, setSelectedCourts] = useState<string[]>([]);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [courts, setCourts] = useState<CourtOption[]>(COURT_OPTIONS_DEFAULT);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchCourts()
      .then((data) => {
        if (mounted && data && data.length > 0) {
          setCourts(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load courts:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const toggleCourt = (courtVal: string) => {
    setSelectedCourts((prev) =>
      prev.includes(courtVal) ? prev.filter((c) => c !== courtVal) : [...prev, courtVal]
    );
  };

  const setYearPreset = (from: string, to: string) => {
    setYearFrom(from);
    setYearTo(to);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set('q', query.trim());
    }
    if (selectedCourts.length > 0) {
      params.set('court_type', selectedCourts.join(','));
    }
    if (yearFrom.trim()) {
      params.set('year_from', yearFrom.trim());
    }
    if (yearTo.trim()) {
      params.set('year_to', yearTo.trim());
    }
    params.set('page', '1');

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 md:py-20 bg-stone-50/50 dark:bg-stone-950 transition-colors">
      <div className="w-full max-w-3xl flex flex-col items-center">
        
        {/* Title & Brand Presence */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 text-xs font-interface font-medium">
            <Building2 className="w-3.5 h-3.5" />
            <span>United States Federal Court System</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 font-interface mb-3">
            Search Federal Court Opinions
          </h1>
          <p className="text-base text-stone-600 dark:text-stone-400 max-w-xl font-interface">
            Instant full-text access across U.S. Supreme Court, Circuit Courts of Appeals, District, and Bankruptcy decisions.
          </p>
        </div>

        {/* Large Centered Search Box */}
        <form onSubmit={handleSearchSubmit} className="w-full mb-6">
          <div className="relative group shadow-sm hover:shadow-md transition-shadow rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus-within:border-stone-500 dark:focus-within:border-stone-500 focus-within:ring-2 focus-within:ring-stone-400/20">
            <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-stone-400 dark:text-stone-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by case name or citation, e.g. Miranda v. Arizona or 410 U.S. 113"
              className="w-full pl-11 sm:pl-13 pr-24 sm:pr-28 py-4 sm:py-4.5 bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-base sm:text-lg focus:outline-none font-interface rounded-xl"
              autoFocus
            />
            <div className="absolute inset-y-0 right-0 pr-2 sm:pr-2.5 flex items-center gap-1.5">
              <button
                type="submit"
                className="px-4 py-2 sm:py-2.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-sm font-medium font-interface rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4 hidden sm:inline" />
              </button>
            </div>
          </div>
        </form>

        {/* Filters Section (Court Type + Year Range) */}
        <div className="w-full bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 mb-8 transition-colors">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 font-interface">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Search Filters</span>
            </div>
            {(selectedCourts.length > 0 || yearFrom || yearTo) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCourts([]);
                  setYearFrom('');
                  setYearTo('');
                }}
                className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 font-interface cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Court Type Filter */}
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 font-interface mb-2.5">
                Court Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {courts.map((court) => {
                  const isChecked = selectedCourts.includes(court.value);
                  return (
                    <button
                      key={court.value}
                      type="button"
                      onClick={() => toggleCourt(court.value)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-interface transition-all cursor-pointer text-left ${
                        isChecked
                          ? 'border-stone-800 bg-stone-900 text-white dark:border-stone-200 dark:bg-stone-100 dark:text-stone-900 font-medium'
                          : 'border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <span className="truncate mr-1">{court.label}</span>
                      <span className={`text-[11px] tabular-nums shrink-0 ${isChecked ? 'opacity-80' : 'text-stone-400'}`}>
                        {court.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Year Range Filter */}
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 font-interface mb-2.5">
                Year Range
              </label>
              <div className="flex items-center gap-2 mb-2.5">
                <input
                  type="number"
                  placeholder="From (e.g. 1800)"
                  min="1789"
                  max="2026"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs font-interface focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
                <span className="text-stone-400 text-xs font-interface shrink-0">to</span>
                <input
                  type="number"
                  placeholder="To (e.g. 2024)"
                  min="1789"
                  max="2026"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs font-interface focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              {/* Quick Year Presets */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setYearPreset('', '')}
                  className={`px-2 py-1 rounded text-[11px] font-interface transition-colors cursor-pointer ${
                    !yearFrom && !yearTo
                      ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-white font-medium'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  All Time
                </button>
                <button
                  type="button"
                  onClick={() => setYearPreset('2000', '2026')}
                  className={`px-2 py-1 rounded text-[11px] font-interface transition-colors cursor-pointer ${
                    yearFrom === '2000' && yearTo === '2026'
                      ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-white font-medium'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  2000–Present
                </button>
                <button
                  type="button"
                  onClick={() => setYearPreset('1950', '1999')}
                  className={`px-2 py-1 rounded text-[11px] font-interface transition-colors cursor-pointer ${
                    yearFrom === '1950' && yearTo === '1999'
                      ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-white font-medium'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  1950–1999
                </button>
                <button
                  type="button"
                  onClick={() => setYearPreset('1789', '1949')}
                  className={`px-2 py-1 rounded text-[11px] font-interface transition-colors cursor-pointer ${
                    yearFrom === '1789' && yearTo === '1949'
                      ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-white font-medium'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  Pre-1950
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Searches & Quick Links */}
        <div className="w-full">
          <div className="text-xs text-stone-500 dark:text-stone-400 font-interface mb-2.5 text-center sm:text-left">
            <span>Popular searches:</span>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            {SUGGESTED_SEARCHES.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(`/search?q=${encodeURIComponent(item.query)}`)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-600 text-xs font-interface transition-colors cursor-pointer shadow-2xs"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => navigate('/search?q=')}
              className="px-3 py-1.5 rounded-lg border border-dashed border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 text-xs font-interface transition-colors cursor-pointer"
            >
              Browse all cases →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
