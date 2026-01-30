import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { 
  Save, Upload, Loader2, Image as ImageIcon, X, 
  BarChart3, Github, Linkedin, Send, Instagram, Phone, Mail, FileText 
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const TOKEN = localStorage.getItem("portfolio_admin_access"); 

export function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [settings, setSettings] = useState({
    title: "",
    description: "",
    author: "",
    avatarUrl: "",
    cvUrl: "",
    email: "",
    phone: "",
    github: "",
    linkedin: "",
    telegram: "",
    instagram: "",
    projectCount: "",
    experienceYears: "",
    mainStack: "",
  });

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSettings({
            ...data,
            phone: data.phone || "",
            telegram: data.telegram || "",
            instagram: data.instagram || "",
            projectCount: data.projectCount || "10+",
            experienceYears: data.experienceYears || "1+ Years",
          });
        }
      })
      .catch(err => console.error("Yuklashda xato:", err));
  }, []);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_URL}/upload/file`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${TOKEN}` },
      body: formData
    });
    if (!res.ok) throw new Error("Yuklashda xatolik");
    return await res.json();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const data = await uploadFile(file);
      setSettings(prev => ({ ...prev, avatarUrl: data.url }));
    } catch (err) {
      alert("Rasm yuklashda xatolik!");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const res = await fetch(`${API_URL}/settings/admin`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}` 
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) alert("Sozlamalar saqlandi!");
    } catch (err) {
      alert("Xatolik yuz berdi!");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-10">
        {}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sozlamalar</h1>
            <p className="text-muted-foreground">Portfolio va aloqa ma'lumotlarini boshqaring</p>
          </div>
          <Button onClick={handleSave} disabled={saveLoading} className="h-11 px-8">
            {saveLoading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
            O'zgarishlarni saqlash
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {}
          <div className="lg:col-span-1 space-y-8">
            {}
            <section className="p-6 rounded-2xl border bg-card shadow-sm">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ImageIcon size={18} className="text-primary" /> Profil rasmi
              </h3>
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-muted shadow-xl">
                  {settings.avatarUrl ? (
                    <img src={`${API_URL}${settings.avatarUrl}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">Rasm yo'q</div>
                  )}
                  {avatarLoading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                </div>
                <Input type="file" id="avatar" className="hidden" onChange={handleAvatarChange} />
                <Button variant="outline" size="sm" onClick={() => document.getElementById('avatar')?.click()}>
                  Rasmni o'zgartirish
                </Button>
              </div>
            </section>

            {}
            <section className="p-6 rounded-2xl border bg-card shadow-sm">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" /> Statistikalar
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium opacity-70">Loyihalar soni</label>
                  <Input value={settings.projectCount} onChange={e => setSettings({...settings, projectCount: e.target.value})} placeholder="15+" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium opacity-70">Tajriba yili</label>
                  <Input value={settings.experienceYears} onChange={e => setSettings({...settings, experienceYears: e.target.value})} placeholder="2+ Years" />
                </div>
              </div>
            </section>
          </div>

          {}
          <div className="lg:col-span-2 space-y-8">
            {}
            <section className="p-6 rounded-2xl border bg-card shadow-sm space-y-4">
              <h3 className="font-semibold text-lg">Asosiy ma'lumotlar</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm">Ism-sharif</label>
                  <Input value={settings.author} onChange={e => setSettings({...settings, author: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm">Sayt sarlavhasi</label>
                  <Input value={settings.title} onChange={e => setSettings({...settings, title: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm">Main Stack (Sarlavha ostidagi matn)</label>
                <Input value={settings.mainStack} onChange={e => setSettings({...settings, mainStack: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm">Bio / Tavsif</label>
                <Textarea value={settings.description} onChange={e => setSettings({...settings, description: e.target.value})} className="h-32" />
              </div>
            </section>

            {}
            <section className="p-6 rounded-2xl border bg-card shadow-sm space-y-6">
              <h3 className="font-semibold text-lg">Aloqa va Ijtimoiy tarmoqlar</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg text-primary"><Mail size={20} /></div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Email</label>
                    <Input variant="ghost" className="h-8 p-0 border-none focus-visible:ring-0" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} />
                  </div>
                </div>

                {}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg text-green-600"><Phone size={20} /></div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Telefon</label>
                    <Input variant="ghost" className="h-8 p-0 border-none focus-visible:ring-0" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} />
                  </div>
                </div>

                {}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg"><Github size={20} /></div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Github</label>
                    <Input variant="ghost" className="h-8 p-0 border-none focus-visible:ring-0" value={settings.github} onChange={e => setSettings({...settings, github: e.target.value})} />
                  </div>
                </div>

                {}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg text-blue-700"><Linkedin size={20} /></div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">LinkedIn</label>
                    <Input variant="ghost" className="h-8 p-0 border-none focus-visible:ring-0" value={settings.linkedin} onChange={e => setSettings({...settings, linkedin: e.target.value})} />
                  </div>
                </div>

                {}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg text-sky-500"><Send size={20} /></div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Telegram</label>
                    <Input variant="ghost" className="h-8 p-0 border-none focus-visible:ring-0" value={settings.telegram} onChange={e => setSettings({...settings, telegram: e.target.value})} />
                  </div>
                </div>

                {}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg text-pink-600"><Instagram size={20} /></div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Instagram</label>
                    <Input variant="ghost" className="h-8 p-0 border-none focus-visible:ring-0" value={settings.instagram} onChange={e => setSettings({...settings, instagram: e.target.value})} />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}