import { motion } from "motion/react";
import { Briefcase, Code, Folder, User } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function ProfileCard({ data }: { data: any }) {
  
  const avatarSrc = data?.avatarUrl 
    ? (data.avatarUrl.startsWith('http') ? data.avatarUrl : `${API_URL}${data.avatarUrl}`)
    : null;

  const stats = [
    { 
      icon: Folder, 
      label: "Projects", 
      value: data?.projectCount || "10+",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    { 
      icon: Briefcase, 
      label: "Experience", 
      value: data?.experienceYears || "3+ Years",
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    { 
      icon: Code, 
      label: "Main Stack", 
      value: data?.mainStack || "Next.js / NestJS",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl border border-border/40 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm p-6 sm:p-8 lg:p-12 shadow-2xl shadow-black/5 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row gap-8 items-center lg:items-start">
          {/* Avatar */}
          <div className="flex justify-center shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-500 rounded-2xl blur-2xl opacity-30" />
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={data?.author || "Jaloliddin"}
                  className="relative w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48 rounded-2xl object-cover border-4 border-background shadow-xl"
                />
              ) : (
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48 rounded-2xl border-4 border-background shadow-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  <User size={64} className="text-primary/60" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center lg:text-left w-full">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-white">
              {data?.author || "Jaloliddin"}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8">
              {data?.description || "Senior Full-Stack Engineer & AI Specialist"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-white">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-background/50 border border-border/40 hover:border-border/70 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}