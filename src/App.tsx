import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { CasePage } from './pages/CasePage';

const AppContent: React.FC = () => {
  const { path } = useRouter();

  let currentPage = <HomePage />;
  if (path.startsWith('/case/')) {
    currentPage = <CasePage />;
  } else if (path === '/search' || path.startsWith('/search')) {
    currentPage = <SearchPage />;
  } else if (path === '/') {
    currentPage = <HomePage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/30 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <Header />
      <div className="flex-1">
        {currentPage}
      </div>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </ThemeProvider>
  );
}
