import { Link } from "../../lib/router";
import { ArrowRight, Sparkles, FileText } from "lucide-react"; // FileText qo'shdik CV uchun
import { motion } from "motion/react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function Hero({ data }: { data: any }) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      {}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 bg-background/50 backdrop-blur-sm mb-6"
        >
          <Sparkles size={16} className="text-primary" />
          <span className="text-sm text-muted-foreground">
            {}
            Available for new opportunities
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
        >
          {}
          {data?.title || "I build smart, scalable digital products"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
        >
          {}
          {data?.description || "Full-stack software engineer specializing in modern web technologies."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/projects"
            className="group px-8 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            View Projects
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          {}
          {data?.cvUrl ? (
            <a
              href={`${API_URL}${data.cvUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm hover:bg-accent transition-colors flex items-center gap-2"
            >
              <FileText size={18} />
              Download CV
            </a>
          ) : (
            <Link
              href="/#contact"
              className="px-8 py-4 rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm hover:bg-accent transition-colors"
            >
              Get in Touch
            </Link>
          )}
        </motion.div>

        {}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"
        />
      </div>
    </section>
  );
}