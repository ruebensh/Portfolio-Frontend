import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Folder, MessageSquare, Briefcase, TrendingUp, Loader2 } from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";

const API_URL = "http://localhost:3000";

export function AdminDashboard() {
  const [data, setData] = useState({
    projects: [],
    messages: [],
    experience: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectsRes, messagesRes, experienceRes] = await Promise.all([
          fetch(`${API_URL}/projects`),
          fetch(`${API_URL}/messages`),
          fetch(`${API_URL}/experience`),
        ]);

        const [projects, messages, experience] = await Promise.all([
          projectsRes.json(),
          messagesRes.json(),
          experienceRes.json(),
        ]);

        setData({ projects, messages, experience });
      } catch (err) {
        console.error("Dashboard yuklashda xato:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      icon: Folder,
      label: "Total Projects",
      value: data.projects.length,
      change: "Bazadagi loyihalar",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: MessageSquare,
      label: "Unread Messages",
      value: data.messages.filter((m: any) => !m.read).length,
      change: "Yangi so'rovlar",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Briefcase,
      label: "Experience Entries",
      value: data.experience.length,
      change: "Ish joylari",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: TrendingUp,
      label: "Active Projects",
      value: data.projects.filter((p: any) => p.status === "Live").length,
      change: "Online loyihalar",
      color: "from-orange-500 to-orange-600",
    },
  ];

  if (loading) return (
    <AdminLayout>
      <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Xush kelibsiz! Portfolioingiz holati haqida umumiy ma'lumot.</p>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-6 rounded-2xl border border-border/40 bg-card shadow-sm"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="text-xs text-primary mt-2">{stat.change}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {}
          <div className="p-6 rounded-2xl border border-border/40 bg-card">
            <h2 className="text-xl font-semibold mb-6">Recent Messages</h2>
            <div className="space-y-4">
              {data.messages.slice(0, 3).map((msg: any) => (
                <div key={msg.id} className="p-4 rounded-lg border bg-background/50">
                  <div className="flex justify-between font-medium">
                    <span>{msg.name}</span>
                    {!msg.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div className="text-xs text-muted-foreground">{msg.email}</div>
                  <div className="text-sm line-clamp-1 mt-1">{msg.text}</div>
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="p-6 rounded-2xl border border-border/40 bg-card">
            <h2 className="text-xl font-semibold mb-6">Recent Projects</h2>
            <div className="space-y-3">
              {data.projects.slice(0, 5).map((project: any) => (
                <div key={project.id} className="p-4 rounded-lg border bg-background/50 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{project.title}</div>
                    <div className="text-xs text-muted-foreground">{project.category}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">{project.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}