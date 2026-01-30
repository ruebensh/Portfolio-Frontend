import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useRouter, Link } from "../lib/router";
import { ArrowLeft, ExternalLink, Github, Loader2 } from "lucide-react"; // Loader qo'shildi
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

const API_URL = "http://localhost:3000";

export function ProjectDetailPage() {
  const { params } = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`${API_URL}/projects`);
        const data = await response.json();
        
        const found = data.find((p: any) => String(p.id) === params.slug || String(p.id) === params.id);
        setProject(found);
      } catch (error) {
        console.error("Xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.slug, params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Loyiha topilmadi</h1>
          <p className="text-muted-foreground mb-8">Siz qidirayotgan loyiha bazada mavjud emas.</p>
          <Link href="/projects">
            <Button>Loyihalarga qaytish</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <Link href="/projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={18} /> Orqaga qaytish
          </Link>
        </motion.div>

        {}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge variant="secondary" className="px-3 py-1">{project.category || "Web Development"}</Badge>
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
              {project.status || "Live"}
            </div>
          </div>

          <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 tracking-tight">
            {project.title}
          </h1>
          
          <div className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-3xl">
            {}
            {project.description || "Ushbu loyiha haqida ma'lumot berilmagan."}
          </div>

          <div className="flex flex-wrap gap-4">
            <a href={project.link} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 px-8">
                <ExternalLink size={20} /> Loyihani ko'rish
              </Button>
            </a>
          </div>
        </motion.div>

        {}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-border/50 bg-muted shadow-2xl">
            <img
              src={`${API_URL}${project.imageUrl}`}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-border/40">
           <div>
             <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Turkum</h4>
             <p className="text-lg font-medium">{project.category || "Portfolio"}</p>
           </div>
           <div>
             <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Holat</h4>
             <p className="text-lg font-medium">{project.status || "Muvaffaqiyatli yakunlangan"}</p>
           </div>
           <div>
             <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Havola</h4>
             <a href={project.link} className="text-blue-500 hover:underline break-all">{project.link}</a>
           </div>
        </div>
      </div>
    </div>
  );
}