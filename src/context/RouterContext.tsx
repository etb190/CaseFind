import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface RouterContextType {
  path: string;
  searchParams: URLSearchParams;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  goBack: () => void;
}

const RouterContext = createContext<RouterContextType>({
  path: '/',
  searchParams: new URLSearchParams(),
  navigate: () => {},
  goBack: () => {},
});

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUrl, setCurrentUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname + window.location.search;
    }
    return '/';
  });

  const updateLocation = useCallback(() => {
    setCurrentUrl(window.location.pathname + window.location.search);
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', updateLocation);
    return () => window.removeEventListener('popstate', updateLocation);
  }, [updateLocation]);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      window.history.replaceState(null, '', to);
    } else {
      window.history.pushState(null, '', to);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentUrl(to);
  }, []);

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/search');
    }
  }, [navigate]);

  const [pathname, search] = currentUrl.split('?');
  const searchParams = new URLSearchParams(search || '');

  return (
    <RouterContext.Provider
      value={{
        path: pathname || '/',
        searchParams,
        navigate,
        goBack,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => useContext(RouterContext);
