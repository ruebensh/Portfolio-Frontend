import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType>({
  currentPath: '/',
  navigate: () => {},
  params: {},
});

export const useRouter = () => useContext(RouterContext);

export function Router({ children }: { children: ReactNode }) {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash.slice(1) || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || '/');
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };
  const getParams = () => {
    const params: Record<string, string> = {};
    const pathSegments = currentPath.split('/').filter(Boolean);
    
    if (pathSegments[0] === 'project' && pathSegments[1]) {
      params.slug = pathSegments[1];
    }
    
    return params;
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate, params: getParams() }}>
      {children}
    </RouterContext.Provider>
  );
}

interface LinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function Link({ href, children, className }: LinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = href;
  };

  return (
    <a href={`#${href}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
