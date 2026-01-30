import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Award, Heart, Code, BookOpen, Loader2 } from "lucide-react";

const API_URL = "http://localhost:3000";

export function AboutPage() {
  const [data, setData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/about`).then(res => res.json()),
      fetch(`${API_URL}/settings`).then(res => res.json())
    ])
    .then(([aboutData, settingsData]) => {
      setData(aboutData);
      setSettings(settingsData);
    })
    .catch(err => console.error("Xatolik:", err))
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }
  const getAvatarUrl = () => {
    if (!settings?.avatarUrl) return "https://via.placeholder.com/150";
    if (settings.avatarUrl.startsWith('http')) return settings.avatarUrl;
    return `${API_URL}${settings.avatarUrl}`;
  };

  const content = data || {
    story: "",
    education: [],
    certificates: [],
    values: [],
    currentlyLearning: [],
    currentlyWorking: []
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center md:text-left"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">About Me</h1>
          <p className="text-xl text-muted-foreground">
            Get to know the person behind the code
          </p>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <div className="flex justify-center mb-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-500 rounded-2xl blur-2xl opacity-20" />
              <img
                src={getAvatarUrl()}
                alt={settings?.author || "Jaloliddin"}
                className="relative w-48 h-48 rounded-2xl object-cover border-4 border-background shadow-2xl"
              />
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {content.story?.split('\n\n').map((paragraph: string, index: number) => (
              <p key={index} className="text-muted-foreground leading-relaxed mb-4 text-center md:text-left">
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>

        {}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="text-primary" size={20} />
            </div>
            <h2 className="text-2xl font-bold">Education</h2>
          </div>
          <div className="space-y-4">
            {content.education?.map((edu: any, index: number) => (
              <div key={index} className="p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm">
                <h3 className="font-semibold mb-1">{edu.degree}</h3>
                <p className="text-muted-foreground text-sm">{edu.institution} • {edu.year}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Award className="text-primary" size={20} />
            </div>
            <h2 className="text-2xl font-bold">Certificates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.certificates?.map((cert: any, index: number) => (
              <div key={index} className="p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm">
                <h3 className="font-semibold mb-1">{cert.name}</h3>
                <p className="text-muted-foreground text-sm">{cert.issuer} • {cert.year}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Values */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="text-primary" size={20} />
            </div>
            <h2 className="text-2xl font-bold">Values & Principles</h2>
          </div>
          <div className="space-y-4">
            {content.values?.map((v: any, index: number) => (
              <div key={index} className="p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Learning & Working On */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="text-primary" size={20} />
              </div>
              <h2 className="text-2xl font-bold">Currently Learning</h2>
            </div>
            <div className="p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm">
              <ul className="space-y-3">
                {content.currentlyLearning?.map((item: any, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Code className="text-primary" size={20} />
              </div>
              <h2 className="text-2xl font-bold">Currently Working On</h2>
            </div>
            <div className="p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm">
              <ul className="space-y-3">
                {content.currentlyWorking?.map((item: any, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}