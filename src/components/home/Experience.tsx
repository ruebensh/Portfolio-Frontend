import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Loader2 } from "lucide-react";

const API_URL = "http://localhost:3000";

export function Experience() {
  const [experienceData, setExperienceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/experience`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((exp: any) => ({
          ...exp,
          impact: exp.impacts?.map((i: any) => i.text) || []
        }));
        setExperienceData(formatted);
      })
      .catch((err) => console.error("Xatolik:", err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr || dateStr === "Present") return "Present";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (experienceData.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Experience</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          My professional journey and key contributions
        </p>
      </motion.div>

      <div className="relative">
        {}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border/40 hidden md:block" />

        <div className="space-y-12">
          {experienceData.map((exp, index) => (
            <motion.div
              key={exp.id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 ${
                index % 2 === 0 ? "" : "md:flex-row-reverse"
              }`}
            >
              {}
              <div className="absolute left-8 md:left-1/2 top-8 w-4 h-4 -ml-2 rounded-full bg-primary border-4 border-background shadow-lg shadow-primary/20 hidden md:block" />

              {}
              <div className={`${index % 2 === 0 ? "md:text-right md:pr-12" : "md:col-start-2 md:pl-12"}`}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
                  <Calendar size={14} />
                  {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                </div>

                <div className="p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                  {}
                  <div className={`flex items-center gap-4 mb-4 ${index % 2 === 0 ? "md:justify-end" : ""}`}>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                      {exp.logo || exp.company.charAt(0)}
                    </div>
                    <div className={index % 2 === 0 ? "md:text-right" : "text-left"}>
                      <h3 className="text-xl font-semibold">{exp.role}</h3>
                      <p className="text-muted-foreground">{exp.company}</p>
                    </div>
                  </div>

                  {}
                  <ul className={`space-y-2 ${index % 2 === 0 ? "md:text-right" : "text-left"}`}>
                    {exp.impact.map((item: string, i: number) => (
                      <li
                        key={i}
                        className={`text-sm text-muted-foreground flex items-start gap-2 ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="flex-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {}
              <div className={`hidden md:block ${index % 2 === 0 ? "" : "md:col-start-1"}`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}