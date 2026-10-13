import React from 'react';
import { CourtOption } from '../types';
import { ChevronDown } from 'lucide-react';

/** Friendly labels for court type codes returned by the API */
export const COURT_TYPE_LABELS: Record<string, string> = {
  SCOTUS: 'Supreme Court',
  F: 'Appeals',
  FD: 'District',
  FB: 'Bankruptcy',
  FS: 'Special Jurisdiction',
};

export type SearchScope = 'title' | 'text' | 'both';

export const SCOPE_OPTIONS: { value: SearchScope; label: string }[] = [
  { value: 'title', label: 'Case name' },
  { value: 'text', label: 'Opinion text' },
  { value: 'both', label: 'Title & text' },
];

interface CourtSelectProps {
  courts: CourtOption[];
  value: string; // '' = all courts
  onChange: (value: string) => void;
  className?: string;
}

/** Dropdown for court type: All / Supreme Court / Appeals / District / Special */
export const CourtSelect: React.FC<CourtSelectProps> = ({ courts, value, onChange, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter by court"
        className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs font-interface focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer"
      >
        <option value="">All courts</option>
        {courts.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
            {c.count !== undefined ? ` (${c.count.toLocaleString()})` : ''}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400" />
    </div>
  );
};

interface ScopeSelectProps {
  value: SearchScope;
  onChange: (v: SearchScope) => void;
  className?: string;
}

/** Segmented control: search in case name / opinion text / both */
export const ScopeSelect: React.FC<ScopeSelectProps> = ({ value, onChange, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-interface ${className}`}
      role="group"
      aria-label="Search scope"
    >
      {SCOPE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
            value === opt.value
              ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium shadow-xs'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
