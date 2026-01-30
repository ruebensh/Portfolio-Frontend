import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { Save, Plus, Trash2, Loader2, GraduationCap, Award, Lightbulb, BookOpen, Briefcase } from "lucide-react";

const API_URL = "http://localhost:3000";
const TOKEN = localStorage.getItem("token") || ""; 

export function AdminAbout() {
  const [saveLoading, setSaveLoading] = useState(false);
  const [story, setStory] = useState("");
  
  const [education, setEducation] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [values, setValues] = useState<string[]>([]);
  const [currentlyLearning, setCurrentlyLearning] = useState<string[]>([]);
  const [currentlyWorking, setCurrentlyWorking] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/about`)
      .then(async (res) => {
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      })
      .then(data => {
        if (data) {
          setStory(data.story || "");
          setEducation(data.education || []);
          setCertificates(data.certificates || []);
          setValues(data.values?.map((v: any) => typeof v === 'string' ? v : v.text) || []);
          setCurrentlyLearning(data.currentlyLearning?.map((l: any) => typeof l === 'string' ? l : l.text) || []);
          setCurrentlyWorking(data.currentlyWorking?.map((w: any) => typeof w === 'string' ? w : w.text) || []);
        }
      })
      .catch(err => console.error("Ma'lumot yuklashda xato:", err));
  }, []);

  const addEducation = () => {
    const degree = prompt("Daraja (masalan: Computer Science):");
    const institution = prompt("O'quv maskani:");
    const year = prompt("Yil (masalan: 2020 - 2024):");
    if (degree && institution && year) {
      setEducation([...education, { degree, institution, year }]);
    }
  };

  const addCertificate = () => {
    const name = prompt("Sertifikat nomi:");
    const issuer = prompt("Beruvchi tashkilot:");
    const year = prompt("Yil:");
    if (name && issuer && year) {
      setCertificates([...certificates, { name, issuer, year }]);
    }
  };

  const addSimpleItem = (setter: any, list: any[], label: string) => {
    const val = prompt(`${label} kiriting:`);
    if (val) setter([...list, val]);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const payload = {
        story,
        education,
        certificates,
        values: values.map(v => ({ text: v })),
        currentlyLearning: currentlyLearning.map(l => ({ text: l })),
        currentlyWorking: currentlyWorking.map(w => ({ text: w }))
      };

      const res = await fetch(`${API_URL}/about/admin`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await res.text(); 
        alert("Hamma ma'lumotlar muvaffaqiyatli saqlandi!");
      } else {
        const errorMsg = await res.text();
        alert(`Xatolik yuz berdi: ${res.status}. ${errorMsg}`);
      }
    } catch (err) {
      console.error("Saqlashda xato:", err);
      alert("Server bilan bog'lanib bo'lmadi!");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">About Content</h1>
            <p className="text-muted-foreground">O'zingiz haqingizdagi ma'lumotlarni boshqarish</p>
          </div>
          <Button onClick={handleSave} disabled={saveLoading} className="gap-2">
            {saveLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Saqlash
          </Button>
        </div>

        {}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl border border-border/40 bg-card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-primary" /> Tarjimai hol (Bio)
          </h2>
          <Textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="min-h-[250px] font-sans text-base leading-relaxed"
            placeholder="O'zingiz haqingizda batafsil yozing..."
          />
        </motion.div>

        {}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border border-border/40 bg-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2"><GraduationCap size={20} className="text-primary" /> Ta'lim</h2>
            <Button variant="outline" size="sm" onClick={addEducation} className="gap-2"> <Plus size={16} /> Qo'shish </Button>
          </div>
          <div className="grid gap-4">
            {education.map((edu, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border/40 bg-background/50 flex justify-between items-center">
                <div>
                  <h4 className="font-bold">{edu.degree}</h4>
                  <p className="text-sm text-muted-foreground">{edu.institution} • {edu.year}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setEducation(education.filter((_, i) => i !== idx))}>
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </motion.div>

        {}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl border border-border/40 bg-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Award size={20} className="text-primary" /> Sertifikatlar</h2>
            <Button variant="outline" size="sm" onClick={addCertificate} className="gap-2"> <Plus size={16} /> Qo'shish </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border/40 bg-background/50 flex justify-between items-center">
                <div>
                  <h4 className="font-bold">{cert.name}</h4>
                  <p className="text-sm text-muted-foreground">{cert.issuer} • {cert.year}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCertificates(certificates.filter((_, i) => i !== idx))}>
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </motion.div>

        {}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-2xl border border-border/40 bg-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Lightbulb size={20} className="text-primary" /> Qadriyatlar</h2>
            <Button variant="outline" size="sm" onClick={() => addSimpleItem(setValues, values, "Qadriyat")} className="gap-2"> <Plus size={16} /> Qo'shish </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            {values.map((v, idx) => (
              <div key={idx} className="px-4 py-2 rounded-full border bg-background/50 flex items-center gap-2">
                <span className="text-sm">{v}</span>
                <button onClick={() => setValues(values.filter((_, i) => i !== idx))}><Trash2 size={12} className="text-destructive" /></button>
              </div>
            ))}
          </div>
        </motion.div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-border/40 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><BookOpen size={18} /> O'rganilmoqda</h3>
              <Button size="sm" variant="ghost" onClick={() => addSimpleItem(setCurrentlyLearning, currentlyLearning, "Mavzu")}><Plus size={16} /></Button>
            </div>
            {currentlyLearning.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-border/20 last:border-0">
                <span className="text-sm">{item}</span>
                <button onClick={() => setCurrentlyLearning(currentlyLearning.filter((_, i) => i !== idx))}><Trash2 size={14} className="text-destructive" /></button>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl border border-border/40 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><Briefcase size={18} /> Ustida ishlanmoqda</h3>
              <Button size="sm" variant="ghost" onClick={() => addSimpleItem(setCurrentlyWorking, currentlyWorking, "Loyiha")}><Plus size={16} /></Button>
            </div>
            {currentlyWorking.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-border/20 last:border-0">
                <span className="text-sm">{item}</span>
                <button onClick={() => setCurrentlyWorking(currentlyWorking.filter((_, i) => i !== idx))}><Trash2 size={14} className="text-destructive" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}