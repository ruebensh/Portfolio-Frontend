import { motion } from "motion/react";
import { Briefcase, Code, Folder } from "lucide-react";

const API_URL = "http://localhost:3000";

export function ProfileCard({ data }: { data: any }) {
  
  const avatarSrc = data?.avatarUrl 
    ? (data.avatarUrl.startsWith('http') ? data.avatarUrl : `${API_URL}${data.avatarUrl}`)
    : "https://content.ibuypower.com/cdn-cgi/image/width=3840,format=auto,quality=75/https://blog-admin.ibuypower.com/wp-content/uploads/2022/07/PC_Gamer_iBUYPOWER_Dream_PC.png?v=e98c3123655b6fdd8e8ca6e6b16ddf91e9a88b84"; // Default rasm

  const stats = [
    { 
      icon: Folder, 
      label: "Projects", 
      value: data?.projectCount || "10+" 
    },
    { 
      icon: Briefcase, 
      label: "Experience", 
      value: data?.experienceYears || "3+ Years" 
    },
    { 
      icon: Code, 
      label: "Main Stack", 
      value: data?.mainStack || "Next.js / NestJS" 
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl border border-border/40 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm p-8 lg:p-12 shadow-2xl shadow-black/5 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 pointer-events-none" />
        
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="flex justify-center lg:justify-start">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-500 rounded-2xl blur-2xl opacity-30" />
              <img
                src={avatarSrc}
                alt={data?.author || "Jaloliddin"}
                className="relative w-40 h-40 lg:w-48 lg:h-48 rounded-2xl object-cover border-4 border-background shadow-xl"
                onError={(e) => console.error("Rasm yuklashda xato:", avatarSrc)}
              />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          <div className="text-center lg:text-left lg:col-span-2">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3 text-white">
              {data?.author || "Jaloliddin"}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              {data?.description || "Senior Full-Stack Engineer & AI Specialist"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-white">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-background/50 border border-border/40"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{stat.value}</div>
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