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
      // Hash o'rniga haqiqiy path-ni olamiz
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    // Brauzerda "Orqaga" yoki "Oldinga" bosilganda sahifani ushlash
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      // PushState yordamida sahifani URL-ni o'zgartiramiz (sahifa yangilanmaydi)
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
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
  onClick?: (e: React.MouseEvent) => void;
}

export function Link({ href, children, className, onClick }: LinkProps) {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
