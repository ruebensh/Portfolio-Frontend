export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://129.146.44.92:3000";

// Helper to format full URL for image/file assets served from NestJS /uploads/
export function resolveUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
}

// Helper for auth headers
export const getAuthHeader = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token") || localStorage.getItem("devini_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Fallback / Mock data ────────────────────────────────────────────────────

const mockSettings = {
  title: "Hi, I’m Jaloliddin — I build practical AI and machine-learning projects.",
  description: "Jaloliddin Xalimov\nData Science — Machine Learning student at School 21",
  author: "Jaloliddin Xalimov",
  avatarUrl: "/uploads/6a8e12e6dbcea657ea1651e7b7d3a98c.jpg",
  cvUrl: "/Jaloliddin_Xalimov_CV.pdf",
  projectCount: "26 ML/Data Science projects",
  experienceYears: "1+ year of hands-on ML learning",
  mainStack: "Python • PyTorch • scikit-learn",
  github: "https://github.com/ruebensh",
  telegram: "https://t.me/jaloliddin_xalimov",
  email: "jaloliddin@example.com",
  phone: "",
};

// ─── Generic fetcher ─────────────────────────────────────────────────────────

async function fetchWithFallback<T>(endpoint: string, fallbackData: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      next: { revalidate: 15 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data ?? fallbackData;
  } catch {
    return fallbackData;
  }
}

export async function clientFetch<T>(endpoint: string, fallbackData: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return fallbackData;
  }
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export const getSettings = async () => {
  const data = await fetchWithFallback<any>("/settings", mockSettings);
  if (data && data.avatarUrl) data.avatarUrl = resolveUrl(data.avatarUrl);
  return data;
};

export const getProjects = async () => {
  const data = await fetchWithFallback<any[]>("/projects", []);
  return (data || []).map((p: any) => ({
    ...p,
    title: p.title || p.name,
    imageUrl: resolveUrl(p.imageUrl || p.photo || p.image),
    category: p.category || (p.tags ? String(p.tags).replace(/[\[\]"]/g, "") : "Project"),
    status: p.status || "Live",
  }));
};

export const getProjectById = async (id: string) => {
  const projects = await getProjects();
  return projects.find((p: any) => String(p.id) === String(id) || p.slug === id) ?? null;
};

export const getSkills = async () => {
  const data = await fetchWithFallback<any[]>("/skills", []);
  if (Array.isArray(data) && data.length > 0) {
    return data.map((cat: any, idx: number) => ({
      id: cat.id || idx + 1,
      category: cat.category || cat.title || cat.name || "Skill Category",
      items: cat.items || [
        { name: cat.title || cat.name || "Skill", level: cat.level || 85 }
      ]
    }));
  }
  return data;
};

export const getExperience = async () => {
  const data = await fetchWithFallback<any[]>("/experience", []);
  return (data || []).map((exp: any) => ({
    ...exp,
    title: exp.role || exp.title,
    company: exp.company,
    year: exp.year || `${exp.startDate || ""} ${exp.endDate ? "– " + exp.endDate : "– Hozir"}`,
    impacts: Array.isArray(exp.impacts) ? exp.impacts.map((i: any) => (typeof i === "string" ? i : i.text)) : [],
  }));
};

export const getAbout = async () => {
  const data = await fetchWithFallback<any>("/about", {});
  if (data) {
    return {
      ...data,
      certificates: (data.certificates || []).map((c: any) => ({
        ...c,
        title: c.name || c.title,
        fileUrl: resolveUrl(c.fileUrl || c.url),
      })),
      values: (data.values || []).map((v: any) => (typeof v === "string" ? v : v.text || v.value)),
      currentlyLearning: (data.currentlyLearning || []).map((l: any) => (typeof l === "string" ? l : l.text || l.name)),
      currentlyWorking: (data.currentlyWorking || []).map((w: any) => (typeof w === "string" ? w : w.text || w.name)),
    };
  }
  return data;
};

export const getCertificates = async () => {
  const data = await fetchWithFallback<any[]>("/certificates", []);
  return (data || []).map((c: any) => ({
    ...c,
    title: c.name || c.title,
    url: resolveUrl(c.fileUrl || c.url),
    category: c.category || "Certificate",
  }));
};

export const getBlogPosts = () => fetchWithFallback<any[]>("/blog/posts", []);

export const sendAIChatMessage = async (message: string, sessionId: string): Promise<string> => {
  try {
    const res = await fetch(`${API_URL}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
    });
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();
    return data.text || data.response || data.message || "Uzr, AI javob bermadi.";
  } catch {
    return "Kechirasiz, hozirda ulanishda muammo bor. Backend server ishlayotganiga ishonch hosil qiling.";
  }
};

export const getAIHistory = async (sessionId: string) => {
  try {
    const res = await fetch(`${API_URL}/ai/history/${sessionId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
};

export const deleteAISession = async (sessionId: string) => {
  try {
    await fetch(`${API_URL}/ai/session/${sessionId}`, { method: "DELETE" });
  } catch { /* silent */ }
};

export const sendMessage = async (name: string, email: string, message: string) => {
  try {
    const res = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });
    if (!res.ok) throw new Error("Xatolik yuz berdi");
    return await res.json();
  } catch (error) {
    console.error("Message send error:", error);
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  const endpoints = [`${API_URL}/auth/login`, `${API_URL}/admin/login`, `${API_URL}/login`];
  let lastErr = new Error("Email yoki parol noto'g'ri");

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (res.ok) {
        const data = await res.json();
        const token = data.access_token || data.token;
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("devini_admin_token", token);
        }
        return { token, ...data };
      }
    } catch (e: any) {
      lastErr = e;
    }
  }
  throw lastErr;
};

export const uploadFile = async (file: File) => {
  const endpoints = [`${API_URL}/upload/file`, `${API_URL}/upload`];
  const formData = new FormData();
  formData.append("file", file);
  const headers = getAuthHeader();

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const rawUrl = data.url || data.filePath || data.fileUrl || (typeof data === "string" ? data : "");
        return resolveUrl(rawUrl);
      }
    } catch {}
  }
  throw new Error("Fayl yuklashda xatolik yuz berdi");
};
