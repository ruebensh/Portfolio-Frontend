import { useState, useEffect } from "react";
import { motion } from "framer-motion"; // motion/react o'rniga framer-motion ishlatish tavsiya etiladi
import { Link } from "../lib/router";
import { Search, Filter, ExternalLink, Github, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

// Dinamik API manzili
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const projectImages = [
  "https://images.unsplash.com/photo-1660165458059-57cfb6cc87e5?q=80&w=1080",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1080",
  "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=1080",
  "https://images.unsplash.com/photo-1519662978799-2f05096d3636?q=80&w=1080",
  "https://images.unsplash.com/photo-1737114666907-4b2c8591398e?q=80&w=1080",
];

export function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>("All");
  
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API so'rovi dinamik manzil orqali
    fetch(`${API_URL}/projects`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Backend ulanishda xato:", err);
        setLoading(false);
      });
  }, []);

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category || "General")))];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory || selectedCategory === "All" || project.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Live": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "In Progress": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      default: return "bg-muted text-muted-foreground border-border/40";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Sarlavha qismi */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">All Projects</h1>
          <p className="text-muted-foreground text-lg">
            Explore my portfolio of {projects.length} projects across different domains
          </p>
        </motion.div>

        {/* Qidiruv va Filtrlar */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search projects..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                  selectedCategory === cat 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-card hover:border-primary/50 border-border/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loyihalar setkasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id || index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Link href={`/project/${project.id}`}>
                <div className="group h-full rounded-2xl border border-border/40 bg-card overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:border-primary/20">
                  {/* Loyiha rasmi */}
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={project.imageUrl ? `${API_URL}${project.imageUrl}` : projectImages[index % projectImages.length]}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getStatusColor(project.status || "Live")}`}>
                        {project.status || "Live"}
                      </div>
                    </div>
                  </div>

                  {/* Ma'lumot qismi */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex items-center gap-4 pt-4 border-t border-border/40">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                        View Details
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bo'sh holat */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No projects found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}