import { Router, useRouter } from "./lib/router";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { AboutPage } from "./pages/AboutPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProjects } from "./pages/admin/AdminProjects";
import { AdminSkills } from "./pages/admin/AdminSkills";
import { AdminExperience } from "./pages/admin/AdminExperience";
import { AdminAbout } from "./pages/admin/AdminAbout";
import { AdminMessages } from "./pages/admin/AdminMessages";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function AppContent() {
  const { currentPath } = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const isAdminRoute = currentPath.startsWith("/admin");

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem("token");
      setAuthChecked(false);
      window.location.href = "/";
    };

    window.addEventListener("admin-logout", handleLogout);
    return () => window.removeEventListener("admin-logout", handleLogout);
  }, []);

  useEffect(() => {
    if (!isAdminRoute) {
      setAuthChecked(false);
      return;
    }

    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token || token === "undefined") {
        const email = prompt("Admin email:");
        const password = prompt("Admin paroli:");

        if (!email || !password) {
          window.location.href = "/";
          return;
        }

        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (res.ok) {
            const data = await res.json();
            localStorage.setItem("token", data.access_token);
            setAuthChecked(true);
          } else {
            alert("Xato! Email yoki parol noto'g'ri.");
            window.location.href = "/";
          }
        } catch (error) {
          console.error("Server xatosi:", error);
          alert("Server xatosi!");
          window.location.href = "/";
        }
      } else {

        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [currentPath]);
  if (isAdminRoute) {
    if (!authChecked) {
      return <div className="min-h-screen bg-black" />;
    }

    switch (currentPath) {
      case "/admin":
        return <AdminDashboard />;
      case "/admin/projects":
        return <AdminProjects />;
      case "/admin/skills":
        return <AdminSkills />;
      case "/admin/experience":
        return <AdminExperience />;
      case "/admin/about":
        return <AdminAbout />;
      case "/admin/messages":
        return <AdminMessages />;
      case "/admin/settings":
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  }

  return (
    <>
      <Header />
      <main className="pt-16">
        {currentPath === "/" && <HomePage />}
        {currentPath === "/projects" && <ProjectsPage />}
        {currentPath.startsWith("/project/") && <ProjectDetailPage />}
        {currentPath === "/about" && <AboutPage />}
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}