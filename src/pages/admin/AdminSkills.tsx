import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Button } from "../../components/ui/button";
import { Plus, Edit, Trash2, Save, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function AdminSkills() {
  const [skillsData, setSkillsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/skills`)
      .then((res) => res.json())
      .then((data) => setSkillsData(data || []))
      .catch((err) => console.error("Xatolik:", err))
      .finally(() => setLoading(false));
  }, []);

  const addCategory = () => {
    const name = prompt("Kategoriya nomi (masalan: Frontend):");
    if (name) {
      setSkillsData([...skillsData, { category: name, items: [] }]);
    }
  };

  const addSkill = (catIdx: number) => {
    const name = prompt("Skill nomi (masalan: React):");
    const level = prompt("Bilish darajasi (0-100):", "80");
    if (name && level) {
      const newData = [...skillsData];
      newData[catIdx].items.push({ name, level: parseInt(level) });
      setSkillsData(newData);
    }
  };

  const removeSkill = (catIdx: number, skillIdx: number) => {
    const newData = [...skillsData];
    newData[catIdx].items.splice(skillIdx, 1);
    setSkillsData(newData);
  };

  const removeCategory = (catIdx: number) => {
    if (confirm("Kategoriyani o'chirmoqchimisiz?")) {
      setSkillsData(skillsData.filter((_, i) => i !== catIdx));
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const res = await fetch(`${API_URL}/skills/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: skillsData }),
      });
      if (res.ok) alert("Muvaffaqiyatli saqlandi!");
      else alert("Xatolik yuz berdi!");
    } catch (err) {
      console.error(err);
      alert("Server bilan aloqa yo'q!");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <AdminLayout><Loader2 className="animate-spin m-auto" /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Skills</h1>
            <p className="text-muted-foreground">Texnik ko'nikmalaringizni boshqaring</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={addCategory} className="gap-2">
              <Plus size={18} /> Add Category
            </Button>
            <Button onClick={handleSave} disabled={saveLoading} className="gap-2">
              {saveLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {skillsData.map((category, catIdx) => (
            <motion.div key={catIdx} className="p-6 rounded-2xl border border-border/40 bg-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">{category.category}</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => addSkill(catIdx)} className="gap-2">
                    <Plus size={16} /> Add Skill
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => removeCategory(catIdx)} className="text-destructive">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.items.map((skill: any, skillIdx: number) => (
                  <div key={skillIdx} className="p-4 rounded-xl border border-border/40 bg-background/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{skill.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{skill.level}%</span>
                        <button onClick={() => removeSkill(catIdx, skillIdx)} className="text-destructive p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${skill.level}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}