import React from 'react';
import { useRouter } from '../context/RouterContext';
import { useTheme } from '../context/ThemeContext';
import { Scale, Moon, Sun, Search, BookOpen } from 'lucide-react';

export const Header: React.FC = () => {
  const { path, navigate } = useRouter();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm border-b border-stone-200 dark:border-stone-800 transition-colors duration-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Wordmark & Brand */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded-md py-1 pr-2 cursor-pointer transition-opacity hover:opacity-90 shrink-0"
        >
          <div className="w-8 h-8 rounded bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center shadow-xs">
            <Scale className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight text-stone-900 dark:text-stone-100 font-interface leading-none">
              JurisSearch
            </span>
            <span className="text-[10px] tracking-wide text-stone-500 dark:text-stone-400 font-interface uppercase mt-0.5">
              Federal Opinions
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium font-interface text-stone-600 dark:text-stone-300">
          <button
            onClick={() => navigate('/')}
            className={`cursor-pointer transition-colors hover:text-stone-900 dark:hover:text-stone-100 ${
              path === '/' ? 'text-stone-900 dark:text-stone-100 font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => navigate('/search')}
            className={`cursor-pointer transition-colors hover:text-stone-900 dark:hover:text-stone-100 ${
              path === '/search' ? 'text-stone-900 dark:text-stone-100 font-semibold' : ''
            }`}
          >
            Search Cases
          </button>
          <button
            onClick={() => navigate('/search?q=')}
            className="cursor-pointer transition-colors hover:text-stone-900 dark:hover:text-stone-100"
          >
            Browse All Opinions
          </button>
          <button
            onClick={() => navigate('/search?court_type=FB')}
            className="cursor-pointer transition-colors hover:text-stone-900 dark:hover:text-stone-100 text-stone-500 dark:text-stone-400"
          >
            Bankruptcy
          </button>
        </nav>

        {/* Zone 3: Actions (Theme Toggle & Search Quick Button) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {path !== '/' && (
            <button
              onClick={() => navigate('/search')}
              aria-label="New search"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium font-interface rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-md text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-700" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
