import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Plus, Trash2, Loader2, X, Image as ImageIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function AdminProjects() {
  const [localProjects, setLocalProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/projects`);
      const data = await response.json();
      setLocalProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Loyihalarni yuklashda xato:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Haqiqatan ham ushbu loyihani o'chirmoqchimisiz?")) return;
    try {
      const response = await fetch(`${API_URL}/admin/projects/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeader() }
      });

      if (response.ok) {
        setLocalProjects((prev) => prev.filter((p) => p.id !== id));
      } else if (response.status === 401) {
        alert("Sessiya muddati tugagan, iltimos pageni yangilang (F5)");
      }
    } catch (error) {
      console.error("O'chirishda xato:", error);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let uploadedImageUrl = "";

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch(`${API_URL}/upload/file`, {
          method: "POST",
          headers: { ...getAuthHeader() },
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedImageUrl = uploadData.url;
        }
      }

      const response = await fetch(`${API_URL}/admin/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader()
        },
        body: JSON.stringify({ 
          title, 
          liveUrl: link, 
          imageUrl: uploadedImageUrl,
          description,
          status: "Live",
          category: "Web Development" 
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setTitle(""); setLink(""); setDescription(""); setImageFile(null);
        loadProjects();
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Loyiha boshqaruvi</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{localProjects.length} ta loyiha</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 w-full sm:w-auto">
            <Plus size={18} /> Yangi qo'shish
          </Button>
        </div>

        {/* Add Project Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-2xl shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
                <X size={20} />
              </button>
              <h2 className="text-xl font-semibold mb-6">Yangi loyiha yaratish</h2>
              
              <form onSubmit={handleAddProject} className="space-y-4">
                <Input placeholder="Loyiha nomi" value={title} onChange={(e) => setTitle(e.target.value)} required className="bg-slate-800" />
                <Input placeholder="Havola (Link)" value={link} onChange={(e) => setLink(e.target.value)} required className="bg-slate-800" />
                <Textarea 
                  placeholder="Tavsif..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="min-h-[100px] bg-slate-800"
                  required 
                />
                
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Loyiha muqovasi</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Loyihani saqlash"}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Projects list */}
        {loading ? (
          <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={32} /></div>
        ) : localProjects.length === 0 ? (
          <div className="rounded-2xl border border-border/40 p-16 text-center text-muted-foreground">
            Hali loyihalar yo'q. Yuqoridagi tugmani bosib qo'shing.
          </div>
        ) : (
          <>
            {/* Mobile: card layout */}
            <div className="sm:hidden space-y-3">
              {localProjects.map((p) => (
                <div key={p.id} className="rounded-xl border border-border/40 bg-card p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                    {p.imageUrl ? (
                      <img src={p.imageUrl.startsWith('http') ? p.imageUrl : `${API_URL}${p.imageUrl}`} className="w-full h-full object-cover" />
                    ) : <ImageIcon size={20} className="text-slate-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{p.title}</div>
                    <div className="text-xs text-blue-400 truncate mt-0.5">{p.liveUrl}</div>
                  </div>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg shrink-0">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop: table layout */}
            <div className="hidden sm:block rounded-xl border border-border/40 bg-card overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-4 w-16">Rasm</th>
                    <th className="p-4">Nomi</th>
                    <th className="p-4">Havola</th>
                    <th className="p-4 text-right w-16">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {localProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="p-4">
                        <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                          {p.imageUrl ? (
                            <img src={p.imageUrl.startsWith('http') ? p.imageUrl : `${API_URL}${p.imageUrl}`} className="w-full h-full object-cover" />
                          ) : <ImageIcon size={16} className="text-muted-foreground" />}
                        </div>
                      </td>
                      <td className="p-4 font-medium">{p.title}</td>
                      <td className="p-4 text-blue-400 truncate max-w-[200px]">{p.liveUrl}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}