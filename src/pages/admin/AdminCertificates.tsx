import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus, Trash2, Loader2, X, FileText, Award } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function AdminCertificates() {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forma holati
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState(""); // Yangi qo'shilgan izoh holati
  const [file, setFile] = useState<File | null>(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/certificates`);
      const data = await response.json();
      setCerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Sertifikatlarni yuklashda xato:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Haqiqatan ham ushbu sertifikatni o'chirmoqchimisiz?")) return;
    try {
      const response = await fetch(`${API_URL}/certificates/admin/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeader() }
      });

      if (response.ok) {
        setCerts((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error("O'chirishda xato:", error);
    }
  };

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Iltimos, fayl yuklang");
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("issuer", issuer);
    formData.append("date", date);
    formData.append("description", description); // Backendga yuboriladigan izoh
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/certificates/admin`, {
        method: "POST",
        headers: { ...getAuthHeader() },
        body: formData,
      });

      if (response.ok) {
        setIsModalOpen(false);
        // Formani tozalash
        setTitle(""); setIssuer(""); setDate(""); setDescription(""); setFile(null);
        loadCertificates();
      } else {
        const errorData = await response.json();
        alert(`Xato: ${errorData.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur z-10 py-2">
          <h1 className="text-2xl font-bold">Sertifikatlar boshqaruvi</h1>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus size={18} /> Yangi qo'shish
          </Button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-2xl shadow-2xl relative">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-semibold mb-6">Yangi sertifikat qo'shish</h2>
              
              <form onSubmit={handleAddCertificate} className="space-y-4">
                <Input 
                  placeholder="Sertifikat nomi" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                  className="bg-slate-800 border-slate-700" 
                />
                <Input 
                  placeholder="Bergan tashkilot (Issuer)" 
                  value={issuer} 
                  onChange={(e) => setIssuer(e.target.value)} 
                  required 
                  className="bg-slate-800 border-slate-700" 
                />
                <Input 
                  type="month" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required 
                  className="bg-slate-800 border-slate-700 text-white" 
                />
                
                {/* IZOH QISMI (TEXTAREA) */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 ml-1">Sertifikat haqida izoh (AI uchun)</label>
                  <textarea 
                    placeholder="Ushbu sertifikat nima haqida? Bot buni bilishi kerak..." 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    required 
                    className="w-full min-h-[100px] p-3 rounded-md bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500 transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 ml-1">Sertifikat fayli (IMG yoki PDF)</label>
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    required
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Saqlash"}
                </Button>
              </form>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
          {loading ? (
            <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={32} /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-slate-400 font-medium">
                <tr>
                  <th className="p-4">Fayl</th>
                  <th className="p-4">Nomi / Tashkilot / Izoh</th>
                  <th className="p-4">Sana</th>
                  <th className="p-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {certs.length === 0 ? (
                  <tr><td colSpan={4} className="p-10 text-center text-slate-500">Sertifikatlar mavjud emas</td></tr>
                ) : certs.map((c) => {
                  const isPdf = c.fileUrl?.toLowerCase().endsWith(".pdf");
                  return (
                    <tr key={c.id} className="hover:bg-slate-900/50 transition-colors group">
                      <td className="p-4">
                        <div className={`w-10 h-10 rounded flex items-center justify-center ${isPdf ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {isPdf ? <FileText size={20} /> : <Award size={20} />}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-200">{c.title || c.name}</div>
                        <div className="text-xs text-slate-500">{c.issuer || c.about?.institution}</div>
                        {/* Ro'yxatda izohni ko'rish (qisqacha) */}
                        {c.description && (
                          <div className="text-[10px] text-blue-400 mt-1 italic line-clamp-1 opacity-70">
                            Izoh: {c.description}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-xs">{c.date || c.year}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDelete(c.id)} 
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="O'chirish"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}