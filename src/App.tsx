import { Router, useRouter } from "./lib/router";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { AboutPage } from "./pages/AboutPage";
import { CertificatesPage } from "./pages/CertificatesPage"; 
import { ResumePage } from "./pages/ResumePage"; 
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProjects } from "./pages/admin/AdminProjects";
import { AdminCertificates } from "./pages/admin/AdminCertificates"; 
import { AdminSkills } from "./pages/admin/AdminSkills";
import { AdminExperience } from "./pages/admin/AdminExperience";
import { AdminAbout } from "./pages/admin/AdminAbout";
import { AdminMessages } from "./pages/admin/AdminMessages";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { useEffect, useState } from "react";
import { BlogPage } from "./pages/BlogPage";

import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AIChatPage } from "./pages/AIChatPage"; 
import ChatAI from "./components/ChatAI";
import { NotFoundPage } from "./pages/NotFoundPage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function AppContent() {
  const { currentPath } = useRouter();
  const isKnownRoute = [
    "/",
    "/projects",
    "/certificates",
    "/resume",
    "/about",
    "/blog",
    "/ai-chat"
  ].includes(currentPath) || currentPath.startsWith("/project/");
  const [authChecked, setAuthChecked] = useState(false);
  const isAdminRoute = currentPath.startsWith("/admin");
  const isAiPage = currentPath === "/ai-chat";

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

    const token = localStorage.getItem("token");
    if (token && token !== "undefined") {
      setAuthChecked(true);
    } else {
      setAuthChecked(false);
    }
  }, [currentPath, isAdminRoute]);

  // Admin yo'nalishlari uchun mantiq
  if (isAdminRoute) {
    if (!authChecked) {
      return <AdminLoginPage onSuccess={() => setAuthChecked(true)} />;
    }

    let AdminContent;
    switch (currentPath) {
      case "/admin": AdminContent = <AdminDashboard />; break;
      case "/admin/projects": AdminContent = <AdminProjects />; break;
      case "/admin/certificates": AdminContent = <AdminCertificates />; break;
      case "/admin/skills": AdminContent = <AdminSkills />; break;
      case "/admin/experience": AdminContent = <AdminExperience />; break;
      case "/admin/about": AdminContent = <AdminAbout />; break;
      case "/admin/messages": AdminContent = <AdminMessages />; break;
      case "/admin/settings": AdminContent = <AdminSettings />; break;
      default: AdminContent = <AdminDashboard />;
    }

    return (
      <>
        {AdminContent}
        {/* Admin paneldan AI chat tugmasini olib tashlashingiz ham mumkin */}
        <ChatAI />
      </>
    );
  }

  // Foydalanuvchi yo'nalishlari
  return (
    <>
      <Header />
      <main className={isAiPage ? "" : "pt-16"}>
        {currentPath === "/" && <HomePage />}
        {currentPath === "/projects" && <ProjectsPage />}
        {currentPath === "/certificates" && <CertificatesPage />} 
        {currentPath === "/resume" && <ResumePage />}
        {currentPath === "/about" && <AboutPage />}
        {currentPath === "/blog" && <BlogPage />}
        {currentPath === "/ai-chat" && <AIChatPage />}
        {currentPath.startsWith("/project/") && <ProjectDetailPage />}
        {!isKnownRoute && <NotFoundPage />}
      </main>
      <Footer />
      {/* Agar /ai-chat sahifasida bo'lsak, ChatAI (kichik tugma) ni yashirishimiz mumkin */}
      {!isAiPage && <ChatAI />}
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