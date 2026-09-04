"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LockKey, 
  Folders, 
  Brain, 
  User, 
  Briefcase, 
  Certificate, 
  EnvelopeSimple, 
  Gear, 
  SignOut,
  Plus,
  Trash,
  X,
  FloppyDisk,
  BookOpen,
  GraduationCap,
  Upload,
  Image as ImageIcon,
  Spinner,
  FileText,
  Certificate as CertIcon,
  PencilSimple,
  Robot,
  ChartLineUp,
  UsersThree,
  Pulse,
  CheckCircle,
  WarningCircle,
  Lightning,
  ShieldCheck,
  Eye,
  PaperPlaneRight
} from "@phosphor-icons/react/dist/ssr";
import { 
  getProjects, 
  getSkills, 
  getAbout, 
  getExperience, 
  getCertificates, 
  getSettings,
  uploadFile,
  login,
  resolveUrl,
  API_URL
} from "@/lib/api";

type Tab = "ai_boss" | "ai_monitoring" | "ai_chats" | "settings" | "projects" | "skills" | "about" | "experience" | "certificates" | "messages";

const getAuthHeader = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token") || localStorage.getItem("devini_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const inputStyle = "w-full rounded-xl border border-white/20 bg-[#0e0e18]/90 text-white placeholder:text-muted/60 p-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors shadow-inner font-sans";
const labelStyle = "text-xs font-semibold text-accent/90 mb-1.5 block uppercase tracking-wider font-mono";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("settings");
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Data states
  const [projects, setProjects] = useState<any[]>([]);
  const [skillsCategories, setSkillsCategories] = useState<any[]>([]);
  const [about, setAbout] = useState<any>({
    story: "",
    education: [],
    certificates: [],
    values: [],
    currentlyLearning: [],
    currentlyWorking: []
  });
  const [experience, setExperience] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    author: "Jaloliddin Xalimov",
    title: "Jaloliddin Xalimov — AI/ML Student & Python Developer",
    description: "Data Science & Machine Learning engineer",
    avatarUrl: "/jaloliddin_profile.png",
    cvUrl: "/Jaloliddin_Xalimov_CV.pdf",
    projectCount: "15+",
    experienceYears: "2+ Years",
    mainStack: "Python • PyTorch • Next.js • FastAPI",
    email: "jaloliddin@example.com",
    phone: "",
    github: "https://github.com/ruebensh",
    linkedin: "",
    telegram: "https://t.me/jaloliddin_xalimov",
    instagram: "https://instagram.com"
  });
  const [messages, setMessages] = useState<any[]>([]);
  const [messageSearchQuery, setMessageSearchQuery] = useState("");

  // AI Boss & Monitoring States
  const [bossMessages, setBossMessages] = useState<Array<{ id: string; role: "user" | "assistant"; text: string; time: string; provider?: string; latencyMs?: number }>>([
    { id: "init", role: "assistant", text: "Salom Boss! Men sizning shaxsiy AI yordamchingizman. Admin panelning Control Center qismiga xush kelibsiz! Bugungi statistikalar yoki mehmonlar haqida so'rashingiz mumkin. 🚀", time: new Date().toLocaleTimeString() }
  ]);
  const [bossInput, setBossInput] = useState("");
  const [bossChatLoading, setBossChatLoading] = useState(false);
  const [aiAnalytics, setAiAnalytics] = useState<any>(null);
  const [guestSessions, setGuestSessions] = useState<any[]>([]);
  const [selectedGuestSessionId, setSelectedGuestSessionId] = useState<string | null>(null);
  const [selectedSessionMessages, setSelectedSessionMessages] = useState<any[]>([]);
  const [loadingSessionMessages, setLoadingSessionMessages] = useState(false);
  const [replyLoadingId, setReplyLoadingId] = useState<number | string | null>(null);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"project" | "certificate" | "experience" | "skill-category">("project");
  const [formData, setFormData] = useState<any>({});
  const [certFormData, setCertFormData] = useState<any>({ title: "", issuer: "", year: "2024-01", description: "", category: "AI/ML", url: "" });
  const [certFile, setCertFile] = useState<File | null>(null);
  const [uploadingProjectImg, setUploadingProjectImg] = useState(false);
  const [uploadingCertFile, setUploadingCertFile] = useState(false);
  // Experience modal state
  const [expFormData, setExpFormData] = useState<any>({ role: "", company: "", year: "", impacts: [] });
  const [expEditIndex, setExpEditIndex] = useState<number | null>(null);
  const [expImpactInput, setExpImpactInput] = useState("");
  // Skill inline add state
  const [newSkillInputs, setNewSkillInputs] = useState<Record<number, { name: string; level: string }>>({})
  const [newCategoryName, setNewCategoryName] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);

    // AI API Handlers
  const fetchAiAnalytics = async () => {
    try {
      const res = await fetch(`${API_URL}/ai/analytics`, { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setAiAnalytics(data);
      }
    } catch {}
  };

  const fetchGuestSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/ai/sessions`, { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setGuestSessions(data.sessions || []);
      }
    } catch {}
  };

  const fetchSessionMessages = async (sessionId: string) => {
    setSelectedGuestSessionId(sessionId);
    setLoadingSessionMessages(true);
    try {
      const res = await fetch(`${API_URL}/ai/session-messages/${sessionId}`, { headers: getAuthHeader() });
      if (res.ok) {
        const msgs = await res.json();
        setSelectedSessionMessages(msgs || []);
      }
    } catch {} finally {
      setLoadingSessionMessages(false);
    }
  };

  const handleSendBossChat = async (overrideMsg?: string) => {
    const textToSend = overrideMsg || bossInput.trim();
    if (!textToSend || bossChatLoading) return;
    if (!overrideMsg) setBossInput("");

    const userMsg = {
      id: Date.now().toString(),
      role: "user" as const,
      text: textToSend,
      time: new Date().toLocaleTimeString()
    };
    setBossMessages(prev => [...prev, userMsg]);
    setBossChatLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/boss-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ message: textToSend }),
      });
      if (res.ok) {
        const data = await res.json();
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          text: data.text || "Javob olindi.",
          time: new Date().toLocaleTimeString(),
          provider: data.provider,
          latencyMs: data.latencyMs
        };
        setBossMessages(prev => [...prev, aiMsg]);
        fetchAiAnalytics();
      }
    } catch {
      setBossMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        text: "Xatolik: Serverga bog'lanib bo'lmadi.",
        time: new Date().toLocaleTimeString()
      }]);
    } finally {
      setBossChatLoading(false);
    }
  };

  const handleDeleteKnowledge = async (id: number) => {
    if (!confirm("Ushbu bilimni o'chirasizmi?")) return;
    try {
      const res = await fetch(`${API_URL}/ai/knowledge/${id}`, { method: "DELETE", headers: getAuthHeader() });
      if (res.ok) {
        fetchAiAnalytics();
      }
    } catch {}
  };

  // Check auth token on mount
  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("devini_admin_token");
    if (token) {
      setIsAuthenticated(true);
      fetchDashboardData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    try {
      const data = await login(email, password);
      if (data && (data.token || data.access_token)) {
        setIsAuthenticated(true);
        fetchDashboardData();
      } else {
        setLoginError(data?.error || "Login yoki parol noto'g'ri");
      }
    } catch {
      setLoginError("Login yoki parol noto'g'ri (Auth error)");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("devini_admin_token");
    setIsAuthenticated(false);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [projData, skillsData, aboutData, expData, certData, settsData] = await Promise.all([
        getProjects().catch(() => []),
        getSkills().catch(() => []),
        getAbout().catch(() => ({})),
        getExperience().catch(() => []),
        getCertificates().catch(() => []),
        getSettings().catch(() => null)
      ]);

      if (projData) setProjects(projData);
      if (skillsData) setSkillsCategories(skillsData);
      if (aboutData) setAbout(aboutData);
      if (expData) setExperience(expData);
      if (certData) setCertificates(certData);
      if (settsData) setSettings((prev: any) => ({ ...prev, ...settsData }));
      fetchAiAnalytics();
      fetchGuestSessions();

      // Fetch messages from backend — GET /messages with JwtAuthGuard
      try {
        const res = await fetch(`${API_URL}/messages`, { headers: getAuthHeader() });
        if (res.ok) {
          const msgs = await res.json();
          setMessages(msgs || []);
        }
      } catch {}
    } catch {
    } finally {
      setLoading(false);
    }
  };

  // AVATAR FILE UPLOAD
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    try {
      const uploadedUrl = await uploadFile(file);
      if (uploadedUrl) {
        setSettings((prev: any) => ({ ...prev, avatarUrl: uploadedUrl }));
        await saveSettingsToBackend({ ...settings, avatarUrl: uploadedUrl });
      }
    } catch {
      alert("Profil rasmini yuklashda xatolik yuz berdi");
    } finally {
      setAvatarLoading(false);
    }
  };

  // SAVE SETTINGS
  const saveSettingsToBackend = async (dataToSave: any) => {
    setSaveLoading(true);
    const endpoints = [`${API_URL}/settings/admin`, `${API_URL}/admin/settings`, `${API_URL}/settings`];
    try {
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify(dataToSave),
          });
          if (res.ok) break;
        } catch {}
      }
      alert("Sozlamalar saqlandi!");
    } catch {
      alert("Saqlashda xatolik yuz berdi");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsToBackend(settings);
  };

  // SAVE SKILLS
  const handleSaveSkills = async () => {
    setSaveLoading(true);
    const endpoints = [`${API_URL}/skills/admin`, `${API_URL}/admin/skills`, `${API_URL}/skills`];
    try {
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({ skills: skillsCategories, categories: skillsCategories }),
          });
          if (res.ok) break;
        } catch {}
      }
      alert("Skills saqlandi!");
    } catch {
      alert("Saqlashda xatolik");
    } finally {
      setSaveLoading(false);
    }
  };

  const addSkillCategory = () => {
    if (!newCategoryName.trim()) return;
    setSkillsCategories([...skillsCategories, { category: newCategoryName.trim(), items: [] }]);
    setNewCategoryName("");
  };

  const addSkillToCategory = (catIndex: number) => {
    const input = newSkillInputs[catIndex];
    if (!input?.name?.trim()) return;
    const level = parseInt(input.level || "85", 10);
    const updated = [...skillsCategories];
    if (!updated[catIndex].items) updated[catIndex].items = [];
    updated[catIndex].items.push({ name: input.name.trim(), level: isNaN(level) ? 85 : level });
    setSkillsCategories(updated);
    setNewSkillInputs(prev => ({ ...prev, [catIndex]: { name: "", level: "" } }));
  };

  const updateSkillInCategory = (catIndex: number, skillIndex: number, field: string, value: string) => {
    const updated = [...skillsCategories];
    if (typeof updated[catIndex].items[skillIndex] === "string") {
      updated[catIndex].items[skillIndex] = { name: updated[catIndex].items[skillIndex], level: 85 };
    }
    updated[catIndex].items[skillIndex] = { ...updated[catIndex].items[skillIndex], [field]: field === "level" ? parseInt(value) || 0 : value };
    setSkillsCategories(updated);
  };

  const removeSkillFromCategory = (catIndex: number, skillIndex: number) => {
    const updated = [...skillsCategories];
    updated[catIndex].items.splice(skillIndex, 1);
    setSkillsCategories(updated);
  };

  const removeCategory = (catIndex: number) => {
    const updated = [...skillsCategories];
    updated.splice(catIndex, 1);
    setSkillsCategories(updated);
  };

  // SAVE ABOUT
  const handleSaveAbout = async () => {
    setSaveLoading(true);
    const endpoints = [`${API_URL}/about/admin`, `${API_URL}/admin/about`, `${API_URL}/about`];
    try {
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify(about),
          });
          if (res.ok) break;
        } catch {}
      }
      alert("About ma'lumotlari saqlandi!");
    } catch {
      alert("Saqlashda xatolik");
    } finally {
      setSaveLoading(false);
    }
  };

  const addEducation = () => {
    const degree = prompt("Daraja / Yo'nalish:");
    const institution = prompt("Muassasa (Masalan: School 21 / TDTU):");
    const year = prompt("Yil (Masalan: 2023 - Hozir):");
    if (degree && institution) {
      setAbout({
        ...about,
        education: [...(about.education || []), { degree, institution, year: year || "2024" }]
      });
    }
  };

  // SAVE EXPERIENCE
  const handleSaveExperience = async () => {
    setSaveLoading(true);
    const endpoints = [`${API_URL}/experience/admin`, `${API_URL}/admin/experience`, `${API_URL}/experience`];
    try {
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({ experience }),
          });
          if (res.ok) break;
        } catch {}
      }
      alert("Tajriba ma'lumotlari saqlandi!");
    } catch {
      alert("Saqlashda xatolik");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleOpenAddExperience = () => {
    setExpFormData({ role: "", company: "", year: "", impacts: [] });
    setExpEditIndex(null);
    setExpImpactInput("");
    setModalType("experience");
    setModalOpen(true);
  };

  const handleEditExperience = (exp: any, idx: number) => {
    setExpFormData({
      role: exp.role || exp.title || "",
      company: exp.company || "",
      year: exp.year || exp.period || "",
      impacts: Array.isArray(exp.impacts) ? exp.impacts.map((i: any) => typeof i === "string" ? i : i.text) : [],
    });
    setExpEditIndex(idx);
    setExpImpactInput("");
    setModalType("experience");
    setModalOpen(true);
  };

  const handleSaveExperienceForm = () => {
    if (!expFormData.role || !expFormData.company) return;
    const updated = [...experience];
    const item = { ...expFormData };
    if (expEditIndex !== null) {
      updated[expEditIndex] = item;
    } else {
      updated.push(item);
    }
    setExperience(updated);
    setModalOpen(false);
  };

  // Keep addImpactToExperience for inline use
  const addImpactToExperience = (expIndex: number) => {
    const text = prompt("Natija / Yutuq matni:");
    if (text) {
      const updated = [...experience];
      if (!updated[expIndex].impacts) updated[expIndex].impacts = [];
      updated[expIndex].impacts.push(text);
      setExperience(updated);
    }
  };

  // PROJECTS MODAL & SAVE / EDIT
  const handleOpenAddProject = () => {
    setModalType("project");
    setFormData({ title: "", description: "", category: "AI / ML", status: "Live", imageUrl: "", githubUrl: "", liveUrl: "", technologies: "", isFeatured: true });
    setModalOpen(true);
  };

  const handleEditProject = (project: any) => {
    setModalType("project");
    setFormData({
      id: project.id,
      title: project.title || project.name || "",
      description: project.description || "",
      category: project.category || "AI / ML",
      status: project.status || "Live",
      imageUrl: project.imageUrl || project.image_url || "",
      githubUrl: project.githubUrl || project.github_url || "",
      liveUrl: project.liveUrl || project.live_url || "",
      technologies: Array.isArray(project.technologies)
        ? project.technologies.join(", ")
        : (project.technologies || ""),
      isFeatured: project.isFeatured ?? true,
    });
    setModalOpen(true);
  };

  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProjectImg(true);
    try {
      const url = await uploadFile(file);
      if (url) {
        setFormData((prev: any) => ({ ...prev, imageUrl: url }));
      }
    } catch {
      alert("Rasm yuklanmadi");
    } finally {
      setUploadingProjectImg(false);
    }
  };

  const handleSaveProjectForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);

    const isEdit = Boolean(formData.id);
    const payload = {
      ...formData,
      technologies: typeof formData.technologies === "string"
        ? formData.technologies.split(",").map((t: string) => t.trim()).filter(Boolean)
        : formData.technologies,
    };

    try {
      let saved = false;
      const endpoints = isEdit
        ? [
            { url: `${API_URL}/admin/projects/${formData.id}`, method: "PATCH" },
            { url: `${API_URL}/projects/${formData.id}`, method: "PATCH" },
            { url: `${API_URL}/admin/projects/${formData.id}`, method: "PUT" },
            { url: `${API_URL}/projects/${formData.id}`, method: "PUT" },
            { url: `${API_URL}/admin/projects`, method: "POST" },
            { url: `${API_URL}/projects`, method: "POST" },
          ]
        : [
            { url: `${API_URL}/admin/projects`, method: "POST" },
            { url: `${API_URL}/projects`, method: "POST" },
          ];

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep.url, {
            method: ep.method,
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            saved = true;
            break;
          }
        } catch {}
      }

      // Update local state immediately
      if (isEdit) {
        setProjects(prev => prev.map(p => String(p.id) === String(formData.id) ? { ...p, ...payload } : p));
      } else {
        setProjects(prev => [{ ...payload, id: payload.id || Date.now() }, ...prev]);
      }

      alert(isEdit ? "Loyiha muvaffaqiyatli tahrirlandi! 🚀" : "Yangi loyiha muvaffaqiyatli saqlandi!");
      setModalOpen(false);
      fetchDashboardData();
    } catch {
      alert("Xatolik yuz berdi");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteProject = async (id: string | number) => {
    if (!confirm("Ushbu loyihani o'chirishni tasdiqlaysizmi?")) return;
    setProjects(projects.filter(p => p.id !== id));
    const endpoints = [`${API_URL}/admin/projects/${id}`, `${API_URL}/projects/${id}`];
    for (const url of endpoints) {
      try {
        await fetch(url, { method: "DELETE", headers: getAuthHeader() });
      } catch {}
    }
  };

  // CERTIFICATES MODAL & SAVE / EDIT / DELETE
  const handleOpenAddCertificate = () => {
    setModalType("certificate");
    setCertFormData({ id: null, title: "", issuer: "", year: "2024-01", description: "", category: "AI/ML", url: "" });
    setCertFile(null);
    setModalOpen(true);
  };

  const handleEditCertificate = (cert: any) => {
    setModalType("certificate");
    setCertFormData({
      id: cert.id,
      title: cert.title || cert.name || "",
      issuer: cert.issuer || "",
      year: cert.date || cert.year || "2024-01",
      description: cert.description || "",
      category: cert.category || "AI/ML",
      url: cert.fileUrl || cert.url || "",
    });
    setCertFile(null);
    setModalOpen(true);
  };

  const handleSaveCertificateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);

    const isEdit = Boolean(certFormData.id);
    try {
      const data = new FormData();
      data.append("title", certFormData.title || certFormData.name || "");
      data.append("name", certFormData.title || certFormData.name || "");
      data.append("issuer", certFormData.issuer || "");
      data.append("date", certFormData.year || "2024-01");
      data.append("year", certFormData.year || "2024-01");
      data.append("description", certFormData.description || "");
      data.append("category", certFormData.category || "AI/ML");
      if (certFile) data.append("file", certFile);

      let saved = false;
      const endpoints = isEdit
        ? [
            { url: `${API_URL}/certificates/admin/${certFormData.id}`, method: "PATCH" },
            { url: `${API_URL}/admin/certificates/${certFormData.id}`, method: "PATCH" },
            { url: `${API_URL}/certificates/${certFormData.id}`, method: "PATCH" },
            { url: `${API_URL}/certificates/admin/${certFormData.id}`, method: "PUT" },
            { url: `${API_URL}/certificates/admin`, method: "POST" },
          ]
        : [
            { url: `${API_URL}/certificates/admin`, method: "POST" },
            { url: `${API_URL}/admin/certificates`, method: "POST" },
          ];

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep.url, {
            method: ep.method,
            headers: getAuthHeader(),
            body: data,
          });
          if (res.ok) { saved = true; break; }
        } catch {}
      }

      // JSON fallback for edit
      if (!saved && isEdit) {
        const jsonBody = { ...certFormData };
        for (const ep of [
          { url: `${API_URL}/certificates/admin/${certFormData.id}`, method: "PATCH" },
          { url: `${API_URL}/certificates/${certFormData.id}`, method: "PUT" },
        ]) {
          try {
            const res = await fetch(ep.url, {
              method: ep.method,
              headers: { "Content-Type": "application/json", ...getAuthHeader() },
              body: JSON.stringify(jsonBody),
            });
            if (res.ok) { saved = true; break; }
          } catch {}
        }
      }

      // File upload fallback for new
      if (!saved && certFile && !isEdit) {
        try {
          const uploadedUrl = await uploadFile(certFile);
          if (uploadedUrl) {
            const jsonBody = { ...certFormData, fileUrl: uploadedUrl, url: uploadedUrl };
            await fetch(`${API_URL}/certificates/admin`, {
              method: "POST",
              headers: { "Content-Type": "application/json", ...getAuthHeader() },
              body: JSON.stringify(jsonBody),
            });
          }
        } catch {}
      }

      // Update local state immediately
      if (isEdit) {
        setCertificates(prev => prev.map(c => String(c.id) === String(certFormData.id)
          ? { ...c, title: certFormData.title, issuer: certFormData.issuer, date: certFormData.year, year: certFormData.year, description: certFormData.description, category: certFormData.category }
          : c
        ));
      }

      alert(isEdit ? "Sertifikat muvaffaqiyatli tahrirlandi! ✏️" : "Sertifikat muvaffaqiyatli saqlandi!");
      setModalOpen(false);
      fetchDashboardData();
    } catch {
      alert("Sertifikatni saqlashda xatolik");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteCertificate = async (id: string | number) => {
    if (!confirm("Ushbu sertifikatni o'chirishni tasdiqlaysizmi?")) return;
    setCertificates(certificates.filter(c => String(c.id) !== String(id)));
    const endpoints = [`${API_URL}/certificates/admin/${id}`, `${API_URL}/admin/certificates/${id}`, `${API_URL}/certificates/${id}`];
    for (const url of endpoints) {
      try {
        await fetch(url, { method: "DELETE", headers: getAuthHeader() });
      } catch {}
    }
  };

  // MESSAGE ACTIONS (REPLY, MARK READ, DELETE)
  const handleReplyToMessage = async (id: number | string, name: string, email: string) => {
    const text = prompt(`${name} (${email}) uchun javob xatingizni kiriting:`);
    if (!text || !text.trim()) return;

    setReplyLoadingId(id);
    try {
      const res = await fetch(`${API_URL}/messages/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        alert("Javob xabari muvaffaqiyatli yuborildi! 🚀");
        setMessages(prev => prev.map(m => String(m.id) === String(id) ? { ...m, read: true } : m));
      } else {
        window.location.href = `mailto:${email}?subject=Javob:%20Devini.io%20portfoliodan&body=${encodeURIComponent(text)}`;
      }
    } catch {
      window.location.href = `mailto:${email}?subject=Javob:%20Devini.io%20portfoliodan&body=${encodeURIComponent(text)}`;
    } finally {
      setReplyLoadingId(null);
    }
  };

  const handleMarkMessageRead = async (id: number | string) => {
    setMessages(prev => prev.map(m => String(m.id) === String(id) ? { ...m, read: true } : m));
    try {
      await fetch(`${API_URL}/messages/${id}/read`, {
        method: "PATCH",
        headers: getAuthHeader(),
      });
    } catch {}
  };

  const handleDeleteMessage = async (id: number | string) => {
    if (!confirm("Ushbu xabarni o'chirasizmi?")) return;
    setMessages(prev => prev.filter(m => String(m.id) !== String(id)));
    try {
      await fetch(`${API_URL}/messages/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
    } catch {}
  };

  // 1. LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface max-w-md w-full p-8 md:p-10 rounded-3xl border border-accent/40 bg-[#0a0a14]/90 backdrop-blur-2xl shadow-[0_25px_70px_-10px_rgba(244,201,93,0.35),0_0_35px_rgba(244,201,93,0.2)]"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mx-auto mb-5 shadow-sm">
            <LockKey size={28} weight="fill" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-center text-white font-display mb-2 drop-shadow-md">
            Admin Panelga Kirish
          </h1>
          <p className="text-xs font-mono text-center text-muted mb-8 uppercase tracking-widest">
            Boshqaruv paneliga kirish uchun login ma'lumotlarini kiriting.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className={labelStyle}>Email Manzil</label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Maxfiy Parol</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyle}
              />
            </div>
            {loginError && <p className="text-xs font-mono text-rose-400 border border-rose-500/30 bg-rose-500/10 p-2.5 rounded-xl">{loginError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl font-mono text-xs uppercase tracking-widest font-bold hover:bg-accent/90 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(244,201,93,0.4)] flex items-center justify-center gap-2"
            >
              {loading ? <Spinner size={18} className="animate-spin" /> : "Tizimga Kirish →"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // 2. DASHBOARD
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "ai_boss", label: "🤖 Boss AI Chat", icon: Robot },
    { id: "ai_monitoring", label: "📊 AI Monitoring", icon: ChartLineUp },
    { id: "ai_chats", label: "👥 Visitor Chats", icon: UsersThree },
    { id: "settings", label: "Sozlamalar & Profil", icon: Gear },
    { id: "projects", label: "Loyihalar", icon: Folders },
    { id: "skills", label: "Skills", icon: Brain },
    { id: "about", label: "About", icon: User },
    { id: "experience", label: "Tajriba", icon: Briefcase },
    { id: "certificates", label: "Sertifikatlar", icon: Certificate },
    { id: "messages", label: "Xabarlar", icon: EnvelopeSimple },
  ];

  return (
    <main className="min-h-screen pt-20 sm:pt-24 pb-16 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto p-4 sm:p-8 md:p-12 rounded-3xl border border-card-border/80 bg-card-bg/75 backdrop-blur-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-6">
          <div>
            <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-accent border border-accent/30 px-3 py-1 inline-block mb-2 rounded-full bg-accent/5 backdrop-blur-md">
              — ADMIN SYSTEM —
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold font-display text-white tracking-tight drop-shadow-md">
              Boshqaruv Paneli
            </h1>
            <p className="text-[11px] sm:text-xs font-mono text-muted mt-1 uppercase tracking-widest">
              Profil rasmi, loyihalar va barcha sozlamalarni boshqarish
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono uppercase tracking-widest hover:bg-rose-500/30 transition-all self-start sm:self-auto shadow-sm"
          >
            <SignOut size={18} /> Chiqish
          </button>
        </div>

        {/* Tab Navigation (Scrollable & Responsive) */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-white/10 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider whitespace-nowrap shrink-0 transition-all ${
                  active
                    ? "bg-accent text-accent-foreground font-bold shadow-[0_0_15px_rgba(244,201,93,0.4)]"
                    : "card-surface-nested text-foreground/80 hover:text-accent hover:border-accent/40"
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-24 text-center text-accent font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-3">
            <Spinner size={24} className="animate-spin" /> Ma'lumotlar yuklanmoqda...
          </div>
        ) : (
          <div>
            {/* SETTINGS TAB WITH AVATAR UPLOAD */}
            {activeTab === "settings" && (
              <form onSubmit={handleSaveSettings} className="space-y-8 max-w-5xl">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-4">
                  <h2 className="text-xl font-bold font-display text-white">Profil & Sozlamalar Boshqaruvi</h2>
                  <button type="submit" disabled={saveLoading} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest font-bold hover:bg-accent/90 transition-all shadow-md self-start sm:self-auto">
                    {saveLoading ? <Spinner size={18} className="animate-spin" /> : <FloppyDisk size={18} />} Saqlash
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Avatar & Stats */}
                  <div className="space-y-6 lg:col-span-1">
                    {/* AVATAR PHOTO UPLOAD CARD */}
                    <div className="card-surface p-6 rounded-2xl border border-white/15 bg-[#0f0f1b]/80 backdrop-blur-xl flex flex-col items-center text-center">
                      <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm font-mono uppercase tracking-wider">
                        <ImageIcon size={20} className="text-accent" /> Profil Rasmi (Avatar)
                      </h3>

                      <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-accent/40 shadow-xl mb-4 bg-black/60 flex items-center justify-center">
                        {settings.avatarUrl ? (
                          <img
                            src={resolveUrl(settings.avatarUrl)}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-mono text-muted">Rasm yo'q</span>
                        )}

                        {avatarLoading && (
                          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center text-accent">
                            <Spinner size={24} className="animate-spin" />
                          </div>
                        )}
                      </div>

                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />

                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={avatarLoading}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/15 border border-accent/30 text-accent text-xs font-mono uppercase tracking-widest font-semibold hover:bg-accent/30 transition-all"
                      >
                        <Upload size={14} /> Rasmni o'zgartirish
                      </button>
                    </div>

                    {/* STATS CARD */}
                    <div className="card-surface p-6 rounded-2xl border border-white/15 bg-[#0f0f1b]/80 backdrop-blur-xl space-y-4">
                      <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider border-b border-white/10 pb-2">Statistikalar</h3>
                      <div>
                        <label className={labelStyle}>Loyihalar Soni</label>
                        <input
                          type="text"
                          value={settings.projectCount || "15+"}
                          onChange={(e) => setSettings({ ...settings, projectCount: e.target.value })}
                          className={inputStyle}
                        />
                      </div>
                      <div>
                        <label className={labelStyle}>Tajriba Yili</label>
                        <input
                          type="text"
                          value={settings.experienceYears || "2+ Years"}
                          onChange={(e) => setSettings({ ...settings, experienceYears: e.target.value })}
                          className={inputStyle}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Main Info & Socials */}
                  <div className="space-y-6 lg:col-span-2">
                    <div className="card-surface p-6 rounded-2xl border border-white/15 bg-[#0f0f1b]/80 backdrop-blur-xl space-y-4">
                      <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider border-b border-white/10 pb-2">Asosiy Ma'lumotlar</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelStyle}>Ism-Sharif (Author)</label>
                          <input
                            type="text"
                            value={settings.author || ""}
                            onChange={(e) => setSettings({ ...settings, author: e.target.value })}
                            className={inputStyle}
                          />
                        </div>
                        <div>
                          <label className={labelStyle}>Sayt Sarlavhasi (Title)</label>
                          <input
                            type="text"
                            value={settings.title || ""}
                            onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                            className={inputStyle}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelStyle}>Main Stack (Hero ostidagi matn)</label>
                        <input
                          type="text"
                          value={settings.mainStack || ""}
                          onChange={(e) => setSettings({ ...settings, mainStack: e.target.value })}
                          className={inputStyle}
                        />
                      </div>

                      <div>
                        <label className={labelStyle}>Bio / Tavsif</label>
                        <textarea
                          rows={4}
                          value={settings.description || ""}
                          onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                          className={inputStyle}
                        />
                      </div>
                    </div>

                    {/* Socials & Contacts */}
                    <div className="card-surface p-6 rounded-2xl border border-white/15 bg-[#0f0f1b]/80 backdrop-blur-xl space-y-4">
                      <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider border-b border-white/10 pb-2">Aloqa va Ijtimoiy Tarmoqlar</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelStyle}>Email</label>
                          <input type="email" value={settings.email || ""} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className={inputStyle} />
                        </div>
                        <div>
                          <label className={labelStyle}>Telefon</label>
                          <input type="text" value={settings.phone || ""} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className={inputStyle} />
                        </div>
                        <div>
                          <label className={labelStyle}>GitHub</label>
                          <input type="text" value={settings.github || ""} onChange={(e) => setSettings({ ...settings, github: e.target.value })} className={inputStyle} />
                        </div>
                        <div>
                          <label className={labelStyle}>LinkedIn</label>
                          <input type="text" value={settings.linkedin || ""} onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })} className={inputStyle} />
                        </div>
                        <div>
                          <label className={labelStyle}>Telegram</label>
                          <input type="text" value={settings.telegram || ""} onChange={(e) => setSettings({ ...settings, telegram: e.target.value })} className={inputStyle} />
                        </div>
                        <div>
                          <label className={labelStyle}>Instagram</label>
                          <input type="text" value={settings.instagram || ""} onChange={(e) => setSettings({ ...settings, instagram: e.target.value })} className={inputStyle} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* PROJECTS TAB */}
            {activeTab === "projects" && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <h2 className="text-xl font-bold font-display text-white">Loyiha Boshqaruvi ({projects.length})</h2>
                  <button onClick={handleOpenAddProject} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest font-bold hover:bg-accent/90 transition-all shadow-md self-start sm:self-auto">
                    <Plus size={16} /> Yangi Qo'shish
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((p) => (
                    <div key={p.id} className="card-surface p-6 rounded-2xl border border-white/15 bg-[#0f0f1b]/80 backdrop-blur-xl flex flex-col justify-between">
                      <div>
                        {p.imageUrl && (
                          <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 bg-black/60 border border-white/10 relative">
                            <img src={resolveUrl(p.imageUrl)} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-white font-display">{p.title}</h3>
                          {p.isFeatured && <span className="text-[10px] font-mono text-accent bg-accent/10 border border-accent/30 px-2 py-0.5 rounded-full">★ Tunnel</span>}
                        </div>
                        <p className="text-xs text-muted line-clamp-3 mb-4 font-sans">{p.description}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                        <button
                          onClick={() => handleEditProject(p)}
                          className="px-3 py-1.5 rounded-xl bg-accent/15 text-accent border border-accent/30 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 hover:bg-accent/30 transition-all font-semibold"
                        >
                          <PencilSimple size={15} /> Tahrirlash
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-all"
                          title="O'chirish"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SKILLS TAB */}
            {activeTab === "skills" && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-4">
                  <h2 className="text-xl font-bold font-display text-white">Skills Boshqaruvi</h2>
                  <button onClick={handleSaveSkills} disabled={saveLoading} className="px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 hover:bg-accent/90 transition-all shadow-md self-start sm:self-auto">
                    <FloppyDisk size={16} /> Saqlash
                  </button>
                </div>

                <div className="space-y-6">
                  {skillsCategories.map((cat, catIdx) => (
                    <div key={catIdx} className="card-surface p-6 rounded-2xl border border-white/15 bg-[#0f0f1b]/80 backdrop-blur-xl">
                      <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
                        <input
                          type="text"
                          value={cat.category || cat.title || ""}
                          onChange={e => {
                            const updated = [...skillsCategories];
                            updated[catIdx] = { ...updated[catIdx], category: e.target.value, title: e.target.value };
                            setSkillsCategories(updated);
                          }}
                          className="bg-transparent text-lg font-bold text-white w-full outline-none border-b border-transparent focus:border-accent pb-0.5 font-display"
                          placeholder="Kategoriya nomi"
                        />
                        <button onClick={() => removeCategory(catIdx)} className="text-rose-400 hover:bg-rose-500/20 p-1.5 rounded-lg transition-all shrink-0">
                          <Trash size={16} />
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        {(cat.items || []).map((sk: any, skillIdx: number) => (
                          <div key={skillIdx} className="p-3 rounded-xl border border-white/10 bg-[#161625]/80 backdrop-blur-md">
                            <div className="flex justify-between items-start mb-2">
                              <input
                                type="text"
                                value={typeof sk === "string" ? sk : sk.name}
                                onChange={e => updateSkillInCategory(catIdx, skillIdx, "name", e.target.value)}
                                className="bg-transparent text-sm font-semibold text-white w-full outline-none border-b border-white/10 focus:border-accent pb-0.5 font-display"
                                placeholder="Skill nomi"
                              />
                              <button onClick={() => removeSkillFromCategory(catIdx, skillIdx)} className="text-rose-400 hover:text-rose-300 ml-2 shrink-0">
                                <X size={14} />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={1}
                                max={100}
                                value={typeof sk === "object" ? sk.level : 80}
                                onChange={e => updateSkillInCategory(catIdx, skillIdx, "level", e.target.value)}
                                className="w-full accent-[hsl(var(--accent))]"
                              />
                              <span className="text-xs font-mono text-accent w-8 text-right shrink-0">{typeof sk === "object" ? sk.level : 80}%</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Inline Add Skill */}
                      <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="Yangi skill nomi (masalan: Docker)"
                          value={newSkillInputs[catIdx]?.name || ""}
                          onChange={e => setNewSkillInputs(prev => ({ ...prev, [catIdx]: { ...prev[catIdx], name: e.target.value } }))}
                          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkillToCategory(catIdx); } }}
                          className={inputStyle + " flex-1 text-xs"}
                        />
                        <input
                          type="number"
                          placeholder="%"
                          min={1}
                          max={100}
                          value={newSkillInputs[catIdx]?.level || ""}
                          onChange={e => setNewSkillInputs(prev => ({ ...prev, [catIdx]: { ...prev[catIdx], level: e.target.value } }))}
                          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkillToCategory(catIdx); } }}
                          className={inputStyle + " w-20 text-xs"}
                        />
                        <button
                          onClick={() => addSkillToCategory(catIdx)}
                          className="px-4 py-2 rounded-xl bg-accent/20 text-accent border border-accent/30 text-xs font-mono uppercase tracking-wider hover:bg-accent/30 transition-all whitespace-nowrap"
                        >
                          <Plus size={14} className="inline mr-1" /> Qo'shish
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inline Add Category */}
                <div className="card-surface p-4 rounded-2xl border border-dashed border-accent/30 bg-accent/5">
                  <p className="text-xs font-mono text-accent uppercase tracking-wider mb-2">Yangi Kategoriya Qo'shish</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Kategoriya nomi (masalan: Backend)"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkillCategory(); } }}
                      className={inputStyle + " flex-1 text-xs"}
                    />
                    <button
                      onClick={addSkillCategory}
                      className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-mono uppercase font-bold hover:bg-accent/90 transition-all whitespace-nowrap"
                    >
                      <Plus size={14} className="inline mr-1" /> Qo'shish
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ABOUT TAB */}
            {activeTab === "about" && (
              <div className="space-y-8 max-w-4xl">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-4">
                  <h2 className="text-xl font-bold font-display text-white">About Ma'lumotlari</h2>
                  <button onClick={handleSaveAbout} disabled={saveLoading} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest font-bold hover:bg-accent/90 transition-all shadow-md self-start sm:self-auto">
                    <FloppyDisk size={18} /> Saqlash
                  </button>
                </div>

                {/* Bio / Story */}
                <div className="card-surface p-6 rounded-2xl border border-white/15 bg-[#0f0f1b]/80 backdrop-blur-xl">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-sm font-mono uppercase tracking-wider">
                    <BookOpen size={20} className="text-accent" /> Tarjimai Hol (Bio)
                  </h3>
                  <textarea
                    rows={6}
                    value={about.story || ""}
                    onChange={(e) => setAbout({ ...about, story: e.target.value })}
                    className={inputStyle}
                    placeholder="O'zingiz haqingizda yozing..."
                  />
                </div>

                {/* Education */}
                <div className="card-surface p-6 rounded-2xl border border-white/15 bg-[#0f0f1b]/80 backdrop-blur-xl">
                  <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                    <h3 className="font-bold text-white flex items-center gap-2 text-sm font-mono uppercase tracking-wider">
                      <GraduationCap size={20} className="text-accent" /> Ta'lim
                    </h3>
                    <button onClick={addEducation} className="text-xs bg-accent/20 text-accent border border-accent/30 px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider hover:bg-accent/30 flex items-center gap-1 transition-all">
                      <Plus size={14} /> Qo'shish
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(about.education || []).map((edu: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl border border-white/10 bg-[#161625]/80 backdrop-blur-md flex justify-between items-center">
                        <div>
                          <p className="font-bold text-sm text-white font-display">{edu.degree}</p>
                          <p className="text-xs font-mono text-muted">{edu.institution} • {edu.year}</p>
                        </div>
                        <button onClick={() => setAbout({ ...about, education: about.education.filter((_: any, i: number) => i !== idx) })} className="text-rose-400 hover:bg-rose-500/20 p-1.5 rounded-lg transition-all">
                          <Trash size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* EXPERIENCE TAB */}
            {activeTab === "experience" && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-4">
                  <h2 className="text-xl font-bold font-display text-white">Tajriba Boshqaruvi</h2>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button onClick={handleOpenAddExperience} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-white/20 transition-all">
                      <Plus size={16} /> Tajriba Qo'shish
                    </button>
                    <button onClick={handleSaveExperience} disabled={saveLoading} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 hover:bg-accent/90 transition-all shadow-md">
                      <FloppyDisk size={16} /> Saqlash
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {experience.map((exp: any, idx: number) => (
                    <div key={idx} className="card-surface p-6 rounded-2xl border border-white/15 bg-[#0f0f1b]/80 backdrop-blur-xl">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-white font-display">{exp.role || exp.title}</h3>
                          <p className="text-accent font-mono text-xs uppercase tracking-wider">{exp.company} {exp.year && <span className="text-muted">• {exp.year}</span>}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditExperience(exp, idx)}
                            className="px-3 py-1.5 rounded-xl bg-accent/15 text-accent border border-accent/30 text-xs font-mono uppercase tracking-wider flex items-center gap-1 hover:bg-accent/30 transition-all"
                          >
                            <PencilSimple size={13} /> Tahrirlash
                          </button>
                          <button onClick={() => setExperience(experience.filter((_, i) => i !== idx))} className="text-rose-400 hover:bg-rose-500/20 p-1.5 rounded-lg transition-all">
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                      <ul className="space-y-1 pl-4 list-disc text-xs text-muted font-sans">
                        {(exp.impacts || []).map((imp: any, i: number) => (
                          <li key={i}>{typeof imp === "string" ? imp : imp.text}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CERTIFICATES TAB */}
            {activeTab === "certificates" && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <h2 className="text-xl font-bold font-display text-white">Sertifikatlar ({certificates.length})</h2>
                  <button onClick={handleOpenAddCertificate} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest font-bold hover:bg-accent/90 transition-all shadow-md self-start sm:self-auto">
                    <Plus size={16} /> Sertifikat Qo'shish
                  </button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((c: any, idx: number) => {
                    const isPdf = c.fileUrl?.toLowerCase().endsWith(".pdf") || c.url?.toLowerCase().endsWith(".pdf");
                    const mediaUrl = resolveUrl(c.fileUrl || c.url);

                    return (
                      <div key={c.id ?? idx} className="card-surface p-6 rounded-2xl border border-white/15 bg-[#0f0f1b]/80 backdrop-blur-xl flex flex-col justify-between">
                        <div>
                          {/* File Preview */}
                          {mediaUrl && (
                            <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 bg-black/60 border border-white/10 relative flex items-center justify-center">
                              {isPdf ? (
                                <div className="flex flex-col items-center gap-2 text-rose-400">
                                  <FileText size={36} />
                                  <span className="text-[10px] font-mono uppercase tracking-widest">PDF Hujjat</span>
                                </div>
                              ) : (
                                <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                          )}

                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-white font-display text-lg leading-snug">{c.title || c.name}</h3>
                          </div>
                          <p className="text-xs font-mono text-accent mb-2">{c.issuer || c.about?.institution} • {c.date || c.year}</p>
                          {c.description && (
                            <p className="text-xs text-muted font-sans line-clamp-2 mb-3 leading-relaxed">
                              {c.description}
                            </p>
                          )}
                          {mediaUrl && (
                            <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline font-mono truncate block mb-4">
                              🔗 {isPdf ? "PDF Hujjatni ochish ↗" : "Faylni ko'rish ↗"}
                            </a>
                          )}
                        </div>
                        <div className="flex items-center justify-between border-t border-white/10 pt-4">
                          <button
                            onClick={() => handleEditCertificate(c)}
                            className="px-3 py-1.5 rounded-xl bg-accent/15 text-accent border border-accent/30 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 hover:bg-accent/30 transition-all font-semibold"
                          >
                            <PencilSimple size={15} /> Tahrirlash
                          </button>
                          <button onClick={() => handleDeleteCertificate(c.id ?? idx)} className="p-2 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-all">
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MESSAGES TAB */}
            {/* 1. BOSS AI CHAT TAB */}
            {activeTab === "ai_boss" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 via-purple-500/5 to-transparent backdrop-blur-xl">
                  <div>
                    <span className="font-mono text-xs text-accent uppercase tracking-widest font-semibold flex items-center gap-2 mb-1">
                      <Robot size={18} weight="fill" /> Personal Control Center • Authenticated Boss Session
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold font-display text-white">Boss AI Assistant</h2>
                    <p className="text-xs text-muted font-mono mt-1">Siz haqiqiy Boss sifatida AIngiz bilan bevosita va maxfiy muloqot qilmoqdasiz.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-xs flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      BOSS AUTH ACTIVE
                    </span>
                  </div>
                </div>

                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleSendBossChat("Bugungi muloqot va AI statistikasi qanday?")} className="px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs transition-all flex items-center gap-1.5">
                    📊 Bugungi statistika
                  </button>
                  <button onClick={() => handleSendBossChat("Mehmonlar oxirgi paytda ko'proq nimalar haqida so'rashmoqda?")} className="px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs transition-all flex items-center gap-1.5">
                    💬 Mehmonlar savollari
                  </button>
                  <button onClick={() => handleSendBossChat("AI klaster provayderlari va tezligi holati qanday?")} className="px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs transition-all flex items-center gap-1.5">
                    ⚡ Cluster Status
                  </button>
                  <button onClick={() => {
                    const fact = prompt("AIga qanday yangi bilim o'rgatmoqchisiz?\nMasalan: o'rgan: Offset 04 jamoamiz bilan yangi ML MVP ustida ishlayapmiz");
                    if (fact) handleSendBossChat(fact.startsWith("o'rgan:") ? fact : `o'rgan: ${fact}`);
                  }} className="px-3.5 py-2 rounded-xl border border-accent/40 bg-accent/15 text-accent hover:bg-accent/20 font-mono text-xs font-bold transition-all flex items-center gap-1.5">
                    🧠 Bilim O'rgatish (Learn)
                  </button>
                </div>

                {/* Chat Display Box */}
                <div className="card-surface p-4 sm:p-6 rounded-2xl border border-white/10 bg-[#0d0d1a]/95 backdrop-blur-xl h-[480px] flex flex-col justify-between shadow-2xl">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {bossMessages.map(msg => (
                      <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-sm font-sans leading-relaxed shadow-lg ${
                          msg.role === "user" 
                            ? "bg-accent/20 border border-accent/40 text-white rounded-br-none" 
                            : "bg-white/10 border border-white/15 text-white/90 rounded-bl-none"
                        }`}>
                          {msg.text}
                          {msg.provider && (
                            <div className="mt-2 pt-2 border-t border-white/10 text-[10px] font-mono text-accent/80 flex items-center justify-between gap-2">
                              <span>⚡ Provider: {msg.provider}</span>
                              {msg.latencyMs && <span>{msg.latencyMs}ms</span>}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-muted mt-1 px-1">{msg.time}</span>
                      </div>
                    ))}
                    {bossChatLoading && (
                      <div className="flex items-center gap-2 text-accent font-mono text-xs p-3 rounded-xl bg-accent/10 border border-accent/20 w-fit animate-pulse">
                        <Spinner size={16} className="animate-spin" /> AI Boss uchun javob tayyorlamoqda...
                      </div>
                    )}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={(e) => { e.preventDefault(); handleSendBossChat(); }} className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Boss, AI ga buyruq bering yoki savol so'rang... (masalan: Bugun nechta odam chatda gaplashdi?)"
                      value={bossInput}
                      onChange={e => setBossInput(e.target.value)}
                      className={inputStyle}
                    />
                    <button
                      type="submit"
                      disabled={bossChatLoading || !bossInput.trim()}
                      className="p-3 rounded-xl bg-accent text-accent-foreground font-bold hover:bg-accent/90 disabled:opacity-40 transition-all shadow-md flex items-center justify-center shrink-0"
                    >
                      <PaperPlaneRight size={20} weight="fill" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* 2. AI CLUSTER MONITORING TAB */}
            {activeTab === "ai_monitoring" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 rounded-2xl border border-white/10 bg-[#0e0e1b]/90 backdrop-blur-xl">
                  <div>
                    <span className="font-mono text-xs text-accent uppercase tracking-widest font-semibold flex items-center gap-2 mb-1">
                      <ChartLineUp size={18} weight="fill" /> Telemetry & Telecommunication
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold font-display text-white">AI Provider Cluster Monitoring</h2>
                    <p className="text-xs text-muted font-mono mt-1">Multi-provider klasteringizning real-vaqtdagi faolligi va yuklamasi.</p>
                  </div>
                  <button onClick={fetchAiAnalytics} className="px-4 py-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-all">
                    🔄 Yangilash
                  </button>
                </div>

                {/* Stats Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl border border-accent/30 bg-accent/10 backdrop-blur-xl">
                    <span className="text-xs font-mono uppercase text-accent font-semibold block mb-1">Total API Providers</span>
                    <span className="text-2xl sm:text-3xl font-bold text-white font-display">
                      {aiAnalytics?.clusterHealth?.totalProviders || 18} <span className="text-xs text-emerald-400 font-mono">Active</span>
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                    <span className="text-xs font-mono uppercase text-muted block mb-1">Total Chat Sessions</span>
                    <span className="text-2xl sm:text-3xl font-bold text-white font-display">
                      {aiAnalytics?.totalSessions || 0}
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                    <span className="text-xs font-mono uppercase text-muted block mb-1">Today's Sessions</span>
                    <span className="text-2xl sm:text-3xl font-bold text-emerald-400 font-display">
                      {aiAnalytics?.todaySessions || 0}
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                    <span className="text-xs font-mono uppercase text-muted block mb-1">Learned Facts (Knowledge)</span>
                    <span className="text-2xl sm:text-3xl font-bold text-amber-400 font-display">
                      {aiAnalytics?.knowledgeCount || 0}
                    </span>
                  </div>
                </div>

                {/* Provider List Table */}
                <div className="p-6 rounded-2xl border border-white/10 bg-[#0c0c16]/90 backdrop-blur-xl space-y-4">
                  <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
                    <Lightning size={18} className="text-accent" /> Faol AI Provayderlar Klasteri
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono text-white/80">
                      <thead>
                        <tr className="border-b border-white/10 text-accent uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-3">Provayder</th>
                          <th className="py-3 px-3">Model</th>
                          <th className="py-3 px-3">Call Count</th>
                          <th className="py-3 px-3">Success / Errors</th>
                          <th className="py-3 px-3">Avg Latency</th>
                          <th className="py-3 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {aiAnalytics?.clusterHealth?.providers?.map((p: any) => (
                          <tr key={p.name} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-3 font-bold text-white">{p.name}</td>
                            <td className="py-3 px-3 text-muted">{p.model}</td>
                            <td className="py-3 px-3">{p.calls}</td>
                            <td className="py-3 px-3">
                              <span className="text-emerald-400 font-bold">{p.success}</span> / <span className="text-rose-400">{p.errors}</span>
                            </td>
                            <td className="py-3 px-3">{p.avgLatencyMs ? `${p.avgLatencyMs}ms` : "-"}</td>
                            <td className="py-3 px-3">
                              {p.status === "active" && <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">🟢 Active</span>}
                              {p.status === "degraded" && <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">🟡 Degraded</span>}
                              {p.status === "error" && <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">🔴 Error</span>}
                            </td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan={6} className="text-center py-6 text-muted">Provayderlar ma'lumoti yuklanmoqda...</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Learned Facts Management Section */}
                <div className="p-6 rounded-2xl border border-white/10 bg-[#0c0c16]/90 backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
                      <Brain size={18} className="text-accent" /> AI O'rgangan Bilimlar Bazasidagi Faktlar
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {aiAnalytics?.knowledgeItems?.map((k: any) => (
                      <div key={k.id} className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between gap-4 text-xs font-mono text-white/90">
                        <span>• [ID #{k.id}] {k.fact}</span>
                        <button onClick={() => handleDeleteKnowledge(k.id)} className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-all">
                          <Trash size={14} />
                        </button>
                      </div>
                    ))}
                    {(!aiAnalytics?.knowledgeItems || aiAnalytics.knowledgeItems.length === 0) && (
                      <p className="text-xs font-mono text-muted py-4 text-center">Hozircha saqlangan maxsus bilimlar yo'q.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. VISITOR CHAT MONITOR TAB */}
            {activeTab === "ai_chats" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 rounded-2xl border border-white/10 bg-[#0e0e1b]/90 backdrop-blur-xl">
                  <div>
                    <span className="font-mono text-xs text-accent uppercase tracking-widest font-semibold flex items-center gap-2 mb-1">
                      <UsersThree size={18} weight="fill" /> Real-time Guest Chat Inspector
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold font-display text-white">Live Visitor Conversations</h2>
                    <p className="text-xs text-muted font-mono mt-1">Mehmonlarning AI yordamchingiz bilan qilgan barcha muloqotlari tarixi.</p>
                  </div>
                  <button onClick={fetchGuestSessions} className="px-4 py-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-all">
                    🔄 Yangilash
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sessions List Column */}
                  <div className="md:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-bold mb-2">Seanslar Ro'yxati ({guestSessions.length})</h3>
                    {guestSessions.map((s: any) => (
                      <div
                        key={s.sessionId}
                        onClick={() => fetchSessionMessages(s.sessionId)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedGuestSessionId === s.sessionId
                            ? "border-accent bg-accent/15 text-white shadow-lg"
                            : "border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-accent mb-1">
                          <span className="truncate max-w-[120px]">ID: {s.sessionId}</span>
                          <span className="px-2 py-0.5 rounded bg-white/10 text-white/70">{s.messageCount} msg</span>
                        </div>
                        <p className="text-xs font-sans text-white/90 line-clamp-2 mb-2 font-medium">"{s.firstMessage}"</p>
                        <span className="text-[10px] font-mono text-muted block text-right">
                          {new Date(s.lastActivityAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {guestSessions.length === 0 && (
                      <p className="text-xs font-mono text-muted py-8 text-center border border-white/10 rounded-xl">Mehmonlar suhbatlari topilmadi.</p>
                    )}
                  </div>

                  {/* Transcript Display Column */}
                  <div className="md:col-span-2 card-surface p-6 rounded-2xl border border-white/10 bg-[#0d0d1a]/95 backdrop-blur-xl h-[600px] flex flex-col justify-between">
                    {selectedGuestSessionId ? (
                      <div className="flex flex-col h-full">
                        <div className="pb-3 mb-4 border-b border-white/10 flex items-center justify-between">
                          <span className="text-xs font-mono text-accent font-bold">Session Inspector: {selectedGuestSessionId}</span>
                          <span className="text-xs font-mono text-muted">{selectedSessionMessages.length} ta xabar</span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                          {loadingSessionMessages ? (
                            <div className="flex items-center justify-center h-full text-accent font-mono text-xs gap-2">
                              <Spinner size={20} className="animate-spin" /> Suhbat yuklanmoqda...
                            </div>
                          ) : (
                            selectedSessionMessages.map((m: any) => (
                              <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-sans leading-relaxed shadow-md ${
                                  m.role === "user"
                                    ? "bg-blue-600/30 border border-blue-400/30 text-white rounded-br-none"
                                    : "bg-white/10 border border-white/15 text-white/90 rounded-bl-none"
                                }`}>
                                  <span className="text-[10px] font-mono text-accent/80 block mb-1 uppercase font-bold">{m.role === "user" ? "👤 Visitor (Mehmon)" : "🤖 AI Assistant"}</span>
                                  {m.content}
                                </div>
                                <span className="text-[9px] font-mono text-muted mt-1 px-1">{new Date(m.createdAt).toLocaleTimeString()}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <Eye size={40} className="text-muted/40 mb-3" />
                        <p className="text-xs font-mono text-muted max-w-xs">Chap tomondagi seanslardan birini tanlang va mehmon suhbatini to'liq o'qing.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. MESSAGES TAB */}
            {activeTab === "messages" && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-xl font-bold font-display text-white">Kelgan Xabarlar ({messages.length})</h2>
                    <p className="text-xs font-mono text-muted mt-0.5">Foydalanuvchilardan kelgan aloqa xabarlari hamda email javoblari</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-accent bg-accent/10 border border-accent/30 px-3 py-1 rounded-full">
                      O'qilmagan: {messages.filter(m => !m.read).length}
                    </span>
                  </div>
                </div>

                {/* Search Bar */}
                <div>
                  <input
                    type="text"
                    placeholder="Ism, email yoki xabar matni bo'yicha qidiruv..."
                    value={messageSearchQuery}
                    onChange={(e) => setMessageSearchQuery(e.target.value)}
                    className={inputStyle}
                  />
                </div>

                {/* Messages List */}
                <div className="space-y-4">
                  {messages
                    .filter((m) =>
                      (m.name || "").toLowerCase().includes(messageSearchQuery.toLowerCase()) ||
                      (m.email || "").toLowerCase().includes(messageSearchQuery.toLowerCase()) ||
                      (m.message || m.text || "").toLowerCase().includes(messageSearchQuery.toLowerCase())
                    )
                    .map((m) => {
                      const isUnread = !m.read;
                      const msgText = m.message || m.text || "";

                      return (
                        <div
                          key={m.id}
                          className={`card-surface p-6 rounded-2xl border transition-all ${
                            isUnread ? "border-accent/60 bg-[#121222]/90 shadow-[0_0_20px_rgba(244,201,93,0.15)]" : "border-white/15 bg-[#0f0f1b]/80"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-white font-display text-lg">{m.name}</h3>
                                {isUnread && (
                                  <span className="text-[9px] font-mono uppercase tracking-widest text-accent-foreground bg-accent px-2 py-0.5 rounded-full font-bold">
                                    Yangi
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-mono text-accent">{m.email}</p>
                              {m.createdAt && (
                                <p className="text-[10px] font-mono text-muted mt-0.5">
                                  {new Date(m.createdAt).toLocaleString("uz-UZ")}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {isUnread && (
                                <button
                                  onClick={() => handleMarkMessageRead(m.id)}
                                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-mono hover:bg-white/20 transition-all"
                                  title="O'qilgan deb belgilash"
                                >
                                  ✓ O'qilgan
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteMessage(m.id)}
                                className="p-2 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-all"
                                title="O'chirish"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl border border-white/10 bg-[#161625]/90 text-sm font-sans text-white/90 leading-relaxed mb-4 whitespace-pre-wrap">
                            {msgText}
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                            <button
                              onClick={() => handleReplyToMessage(m.id, m.name, m.email)}
                              disabled={replyLoadingId === m.id}
                              className="px-4 py-2 rounded-xl bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest font-bold hover:bg-accent/90 transition-all shadow-md flex items-center gap-1.5"
                            >
                              {replyLoadingId === m.id ? <Spinner size={14} className="animate-spin" /> : "📧"} Javob Xati Yuborish
                            </button>
                            <a
                              href={`mailto:${m.email}?subject=Javob:%20Devini.io%20portfoliodan`}
                              className="px-4 py-2 rounded-xl border border-white/20 bg-white/10 text-white font-mono text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
                            >
                              Pochta Ilovasida Ochish ↗
                            </a>
                          </div>
                        </div>
                      );
                    })}

                  {messages.length === 0 && (
                    <p className="text-xs font-mono text-muted text-center py-12">Hozircha kelgan xabarlar yo'q.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PROJECT & CERTIFICATE ADD MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">

            {/* EXPERIENCE MODAL */}
            {modalType === "experience" && (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="card-surface w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-accent/40 bg-[#0a0a14]/95 backdrop-blur-2xl shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
                <button type="button" onClick={() => setModalOpen(false)} className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
                  <X size={16} />
                </button>
                <h2 className="text-xl font-bold font-display text-white">
                  {expEditIndex !== null ? "Tajribani Tahrirlash ✏️" : "Yangi Tajriba Qo'shish 🚀"}
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelStyle}>Lavozim (Role)</label>
                    <input type="text" required placeholder="Masalan: ML Engineer" value={expFormData.role || ""} onChange={e => setExpFormData({ ...expFormData, role: e.target.value })} className={inputStyle} />
                  </div>
                  <div>
                    <label className={labelStyle}>Kompaniya</label>
                    <input type="text" required placeholder="Masalan: Google DeepMind" value={expFormData.company || ""} onChange={e => setExpFormData({ ...expFormData, company: e.target.value })} className={inputStyle} />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Davr / Vaqt</label>
                  <input type="text" placeholder="Masalan: 2023 — Hozir" value={expFormData.year || ""} onChange={e => setExpFormData({ ...expFormData, year: e.target.value })} className={inputStyle} />
                </div>

                <div>
                  <label className={labelStyle}>Yutuqlar / Natijalar</label>
                  <div className="space-y-2 mb-2">
                    {(expFormData.impacts || []).map((imp: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg border border-white/10 bg-[#161625]/80">
                        <p className="text-xs text-white/80 flex-1 font-sans">{imp}</p>
                        <button type="button" onClick={() => setExpFormData({ ...expFormData, impacts: expFormData.impacts.filter((_: any, j: number) => j !== i) })} className="text-rose-400 hover:text-rose-300 shrink-0">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Yangi yutuq qo'shing..."
                      value={expImpactInput}
                      onChange={e => setExpImpactInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && expImpactInput.trim()) {
                          e.preventDefault();
                          setExpFormData({ ...expFormData, impacts: [...(expFormData.impacts || []), expImpactInput.trim()] });
                          setExpImpactInput("");
                        }
                      }}
                      className={inputStyle + " flex-1 text-xs"}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (expImpactInput.trim()) {
                          setExpFormData({ ...expFormData, impacts: [...(expFormData.impacts || []), expImpactInput.trim()] });
                          setExpImpactInput("");
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-mono hover:bg-white/20 transition-all whitespace-nowrap"
                    >
                      <Plus size={14} className="inline" /> Qo'shish
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/20 bg-white/5 text-white/70 font-mono text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                    Bekor qilish
                  </button>
                  <button type="button" onClick={handleSaveExperienceForm} disabled={!expFormData.role || !expFormData.company} className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest font-bold hover:bg-accent/90 transition-all shadow-md disabled:opacity-50">
                    {expEditIndex !== null ? "O'zgarishlarni Saqlash 💾" : "Qo'shish 🚀"}
                  </button>
                </div>
              </motion.div>
            )}

            {modalType === "project" ? (
              <motion.form onSubmit={handleSaveProjectForm} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="card-surface w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-accent/40 bg-[#0a0a14]/95 backdrop-blur-2xl shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
                <button type="button" onClick={() => setModalOpen(false)} className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
                  <X size={16} />
                </button>
                <h2 className="text-xl font-bold font-display text-white">
                  {formData.id ? "Loyihani Tahrirlash ✏️" : "Yangi Loyiha Yaratish 🚀"}
                </h2>

                <div>
                  <label className={labelStyle}>Loyiha Nomi</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Mizan — Sun'iy Intellekt Platformasi"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={inputStyle}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelStyle}>Kategoriya</label>
                    <input
                      type="text"
                      placeholder="Masalan: AI & ML"
                      value={formData.category || "AI & ML"}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Status</label>
                    <select
                      value={formData.status || "Live"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className={inputStyle}
                    >
                      <option value="Live">Live</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Loyiha Muqova Rasmi</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProjectImageUpload}
                    className="block w-full text-xs text-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-mono file:bg-accent file:text-accent-foreground hover:file:bg-accent/90 cursor-pointer"
                  />
                  {formData.imageUrl && (
                    <div className="mt-2 w-full h-24 rounded-xl overflow-hidden border border-white/10 relative bg-black/60">
                      <img src={resolveUrl(formData.imageUrl)} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {uploadingProjectImg && <span className="text-xs font-mono text-accent mt-1 block">Rasm yuklanmoqda...</span>}
                </div>

                <div>
                  <label className={labelStyle}>Tavsif</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Loyiha haqida batafsil ma'lumot..."
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>Texnologiyalar (vergul bilan ajratilgan)</label>
                  <input
                    type="text"
                    placeholder="Python, PyTorch, FastAPI, React, Docker"
                    value={formData.technologies || ""}
                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    className={inputStyle}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelStyle}>GitHub Havolasi</label>
                    <input
                      type="text"
                      placeholder="https://github.com/..."
                      value={formData.githubUrl || ""}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Jonli Demo Havolasi</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={formData.liveUrl || ""}
                      onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-[#161625]/80">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={Boolean(formData.isFeatured)}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-accent rounded cursor-pointer"
                  />
                  <label htmlFor="isFeatured" className="text-xs font-mono text-white cursor-pointer select-none">
                    ⭐ Home tunnelida va 3D Kubda tanlangan loyiha sifatida ko'rsatish
                  </label>
                </div>

                <button type="submit" disabled={saveLoading} className="w-full py-3.5 rounded-xl bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest font-bold hover:bg-accent/90 transition-all shadow-md">
                  {saveLoading ? <Spinner size={18} className="animate-spin mx-auto" /> : (formData.id ? "O'zgarishlarni Saqlash 💾" : "Loyihani Yaratish 🚀")}
                </button>
              </motion.form>
            ) : (
              /* CERTIFICATE ADD MODAL WITH LOCAL FILE UPLOAD */
              <motion.form onSubmit={handleSaveCertificateForm} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="card-surface w-full max-w-lg p-8 rounded-3xl border border-accent/40 bg-[#0a0a14]/95 backdrop-blur-2xl shadow-2xl relative space-y-4">
                <button type="button" onClick={() => setModalOpen(false)} className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
                  <X size={16} />
                </button>
                <h2 className="text-xl font-bold font-display text-white">Yangi Sertifikat Qo'shish</h2>

                <div>
                  <label className={labelStyle}>Sertifikat Nomi</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Machine Learning Specialization"
                    value={certFormData.title || ""}
                    onChange={(e) => setCertFormData({ ...certFormData, title: e.target.value })}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>Beruvchi Muassasa (Issuer)</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Coursera / DeepLearning.AI"
                    value={certFormData.issuer || ""}
                    onChange={(e) => setCertFormData({ ...certFormData, issuer: e.target.value })}
                    className={inputStyle}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Sana / Yil</label>
                    <input
                      type="month"
                      required
                      value={certFormData.year || "2024-01"}
                      onChange={(e) => setCertFormData({ ...certFormData, year: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Kategoriya</label>
                    <input
                      type="text"
                      placeholder="AI/ML, Python, DevOps..."
                      value={certFormData.category || "AI/ML"}
                      onChange={(e) => setCertFormData({ ...certFormData, category: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Sertifikat haqida izoh (AI & foydalanuvchilar uchun)</label>
                  <textarea
                    rows={3}
                    placeholder="Ushbu sertifikat nima haqida? Bot buni bilishi kerak..."
                    value={certFormData.description || ""}
                    onChange={(e) => setCertFormData({ ...certFormData, description: e.target.value })}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>Sertifikat Fayli (Kompyuterdan Rasm yoki PDF)</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    required
                    onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-mono file:bg-accent file:text-accent-foreground hover:file:bg-accent/90 cursor-pointer"
                  />
                  {certFile && <span className="text-xs font-mono text-emerald-400 mt-1 block">Fayl tanlandi: {certFile.name}</span>}
                </div>

                <button type="submit" disabled={saveLoading} className="w-full py-3.5 rounded-xl bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest font-bold hover:bg-accent/90 transition-all shadow-md">
                  {saveLoading ? <Spinner size={18} className="animate-spin inline mr-2" /> : null}
                  Sertifikatni Saqlash
                </button>
              </motion.form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
