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

// AI Sahifasi komponentini import qiling
import { AIChatPage } from "./pages/AIChatPage"; 
// ChatAI - bu kichik suzuvchi tugma bo'lsa kerak
import ChatAI from "./components/ChatAI";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function AppContent() {
  const { currentPath } = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const isAdminRoute = currentPath.startsWith("/admin");
  // AI sahifasida Header/Footer kerak bo'lsa buni o'zgartirmang, 
  // agar to'liq ekran (full screen) bo'lsin desangiz isAiPage ni tekshiramiz:
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
  }, [currentPath, isAdminRoute]);

  // Admin yo'nalishlari uchun mantiq
  if (isAdminRoute) {
    if (!authChecked) {
      return <div className="min-h-screen bg-black" />;
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
        {/* YANGI AI CHAT ROUTE */}
        {currentPath === "/ai-chat" && <AIChatPage />}
        {currentPath.startsWith("/project/") && <ProjectDetailPage />}
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