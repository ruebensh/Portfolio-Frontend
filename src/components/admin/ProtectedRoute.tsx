import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const ADMIN_PASSWORD = "Ja1ol1ddin";
    const authKey = "portfolio_admin_access";
    
    const isSaved = localStorage.getItem(authKey);

    if (isSaved === "true") {
      setIsAuthenticated(true);
    } else {
      const userInput = prompt("Admin panelga kirish uchun parolni kiriting:");
      
      if (userInput === ADMIN_PASSWORD) {
        localStorage.setItem(authKey, "true");
        setIsAuthenticated(true);
      } else {
        alert("Parol noto'g'ri! Sizga ruxsat berilmagan.");
        setIsAuthenticated(false);
      }
    }
  }, []);

  if (isAuthenticated === null) return null;

  if (isAuthenticated === false) return <Navigate to="/" replace />;

  return <>{children}</>;
}