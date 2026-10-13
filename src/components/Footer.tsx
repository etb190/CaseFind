import React from 'react';
import { useRouter } from '../context/RouterContext';

export const Footer: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <footer className="w-full border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 transition-colors py-8 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-interface text-stone-500 dark:text-stone-400">
        <div className="flex items-center gap-2">
          <span className="font-medium text-stone-700 dark:text-stone-300">JurisSearch</span>
          <span aria-hidden="true">·</span>
          <span>United States Federal Court Opinions Database</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/search?court_type=F')}
            className="hover:text-stone-900 dark:hover:text-stone-200 cursor-pointer"
          >
            Appeals
          </button>
          <button
            onClick={() => navigate('/search?court_type=FD')}
            className="hover:text-stone-900 dark:hover:text-stone-200 cursor-pointer"
          >
            District
          </button>
          <button
            onClick={() => navigate('/search?court_type=FB')}
            className="hover:text-stone-900 dark:hover:text-stone-200 cursor-pointer"
          >
            Bankruptcy
          </button>
          <button
            onClick={() => navigate('/search?court_type=FS')}
            className="hover:text-stone-900 dark:hover:text-stone-200 cursor-pointer"
          >
            Special Jurisdiction
          </button>
        </div>
      </div>
    </footer>
  );
};
