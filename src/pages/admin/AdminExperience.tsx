import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Button } from "../../components/ui/button";
import { Plus, Trash2, Calendar, Save, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function AdminExperience() {
  const [expData, setExpData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const fetchExperience = () => {
    setLoading(true);
    fetch(`${API_URL}/experience`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((exp: any) => ({
          ...exp,
          impact: exp.impacts?.map((i: any) => i.text) || []
        }));
        setExpData(formatted);
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExperience();
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr || dateStr === "Present") return "Present";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const addExperience = () => {
    const role = prompt("Role (masalan: Frontend Developer):");
    const company = prompt("Company (masalan: Google):");
    if (role && company) {
      const newEntry = {
        role,
        company,
        logo: company.charAt(0).toUpperCase(),
        startDate: new Date().toISOString(),
        endDate: null,
        impact: []
      };
      setExpData([newEntry, ...expData]);
    }
  };

  const addImpact = (expIdx: number) => {
    const text = prompt("Achievement / Impact text:");
    if (text) {
      const updated = [...expData];
      updated[expIdx].impact = [...updated[expIdx].impact, text];
      setExpData(updated);
    }
  };

  const removeExp = (idx: number) => {
    if (confirm("Ushbu tajribani interfeysdan o'chirmoqchimisiz? Saqlash tugmasini bosganingizda bazadan o'chadi.")) {
      setExpData(expData.filter((_, i) => i !== idx));
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const payload = {
        experience: expData.map((exp) => ({
          role: exp.role,
          company: exp.company,
          logo: exp.logo || exp.company.charAt(0),
          startDate: exp.startDate,
          endDate: exp.endDate,
          impacts: exp.impact || []
        })),
      };

      const res = await fetch(`${API_URL}/experience/admin`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Barcha ma'lumotlar muvaffaqiyatli saqlandi!");
        fetchExperience();
      } else {
        alert("Xatolik: " + (result.message || "Saqlab bo'lmadi"));
      }
    } catch (err: any) {
      console.error("Save error:", err);
      alert("Serverga ulanishda xato yuz berdi.");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading && expData.length === 0) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 pb-20">
        <div className="flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur py-4 border-b border-border/40">
          <div>
            <h1 className="text-3xl font-bold mb-1">Experience</h1>
            <p className="text-sm text-muted-foreground">Professional karerangizni boshqaring</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={addExperience} className="gap-2">
              <Plus size={18} /> Qo'shish
            </Button>
            <Button onClick={handleSave} disabled={saveLoading} className="gap-2">
              {saveLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Saqlash
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {expData.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl text-muted-foreground">
              Hali tajriba yo'shilmagan.
            </div>
          )}
          
          {expData.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group p-6 rounded-3xl border border-border bg-card hover:border-primary/30 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                    {exp.logo}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{exp.role}</h3>
                    <p className="text-primary font-medium">{exp.company}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar size={12} />
                      {formatDate(exp.startDate)} — {formatDate(exp.endDate)}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeExp(index)} 
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={18} />
                </Button>
              </div>

              <div className="lg:pl-16">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">Yutuqlar</h4>
                  <Button variant="secondary" size="sm" onClick={() => addImpact(index)} className="h-7 text-xs">
                    + Qo'shish
                  </Button>
                </div>
                <ul className="space-y-2">
                  {exp.impact.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}