"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { EyebrowBadge } from "@/components/ui/EyebrowBadge";
import { Certificate, X, ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { getCertificates } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function CertificatesPage() {
  const { td } = useLanguage();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    getCertificates().then((data: any) => {
      setCertificates(data || []);
      setLoading(false);
    });
  }, []);

  const categories = ["All", ...Array.from(new Set(certificates.map((c) => c.category || "General")))];
  const filtered = selectedCategory === "All" ? certificates : certificates.filter(c => c.category === selectedCategory);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto p-6 sm:p-10 md:p-12 rounded-3xl border border-card-border/80 bg-card-bg/60 backdrop-blur-xl shadow-2xl">
        <AnimatedSection>
          <AnimatedItem className="mb-10">
            <EyebrowBadge className="mb-4">{td("Sertifikatlar")}</EyebrowBadge>
            <h1 className="heading-gradient-gold text-4xl md:text-6xl font-bold tracking-tighter mb-4 font-display">
              {td("Sertifikatlar va Yutuqlar")}
            </h1>
            <p className="page-subtitle">
              {td("Rasmiy sertifikatlar hamda ishtirok etilgan xalqaro ideaton va tadbirlar ro'yxati.")}
            </p>
          </AnimatedItem>

          {/* Category filter */}
          <AnimatedItem className="mb-10">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    selectedCategory === cat
                      ? "bg-accent text-accent-foreground border-accent shadow-sm"
                      : "card-surface-nested text-muted hover:border-accent/40"
                  }`}
                >
                  {cat === "All" ? td("Barchasi") : td(cat)}
                </button>
              ))}
            </div>
          </AnimatedItem>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((cert: any, idx: number) => (
                <motion.div
                  key={cert.id ?? idx}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring" as const, stiffness: 100, damping: 20 }}
                >
                  <button
                    onClick={() => setSelected(cert)}
                    className="card-surface w-full text-left p-7 hover:-translate-y-1 transition-transform duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                      <Certificate size={24} weight="fill" />
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {td(cert.title || cert.name)}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">{td(cert.issuer)}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-muted">{cert.year}</span>
                      {cert.category && (
                        <span className="text-xs px-2.5 py-1 rounded-full card-surface-nested text-muted">{td(cert.category)}</span>
                      )}
                    </div>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <AnimatedItem className="text-center py-20">
              <p className="text-zinc-400 dark:text-zinc-500 text-lg">{td("Bu kategoriyada sertifikat yo'q.")}</p>
            </AnimatedItem>
          )}
        </AnimatedSection>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card-surface w-full max-w-md p-8 relative"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                <Certificate size={28} weight="fill" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{td(selected.title || selected.name)}</h2>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-1">{td(selected.issuer)}</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">{selected.year}</p>
              {selected.description && (
                <p className="text-xs text-muted mb-4 font-sans leading-relaxed">{td(selected.description)}</p>
              )}
              {selected.url && (
                <a href={selected.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                  <ArrowSquareOut size={16} /> {td("Sertifikatni Ko'rish")}
                </a>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
