"use client";

import React, { useEffect, useState } from "react";
import { getProjects, resolveUrl } from "@/lib/api";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { EyebrowBadge } from "@/components/ui/EyebrowBadge";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowSquareOut, GithubLogo, Globe } from "@phosphor-icons/react/dist/ssr";
import RoundCarousel from "@/components/originkit/ui/roundcarousel";

export default function ProjectsPage() {
  const { td } = useLanguage();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const carouselImages = projects
    .filter((project) => project?.imageUrl)
    .slice(0, 8)
    .map((project) => ({
      src: resolveUrl(project.imageUrl),
    }));

  useEffect(() => {
    getProjects()
      .then((data) => setProjects(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto p-6 sm:p-10 md:p-12 rounded-3xl border border-card-border/80 bg-card-bg/60 backdrop-blur-xl shadow-2xl">
        <AnimatedSection>
          <AnimatedItem className="mb-12">
            <EyebrowBadge className="mb-4">{td("Portfolio")}</EyebrowBadge>
            <h1 className="heading-gradient-cyan text-4xl md:text-6xl font-bold tracking-tighter mb-4 font-display">
              {td("Barcha Loyihalar")}
            </h1>
            <p className="page-subtitle font-sans">
              {td("Men yaratgan eng so'nggi va asosiy loyihalar ro'yxati bilan tanishing.")}
            </p>
          </AnimatedItem>

          {carouselImages.length > 0 && (
            <AnimatedItem className="mb-12 hidden xl:block">
              <div className="rounded-[2rem] border border-white/10 bg-[#05070d]/90 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
                <div className="mb-4 flex items-center justify-between">
                  <EyebrowBadge>{td("Featured Projects")}</EyebrowBadge>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                    {Math.min(projects.length, 8)} Featured
                  </span>
                </div>
                <div className="h-[500px] w-full bg-[#05070d] rounded-[1.5rem]">
                  <RoundCarousel
                    items={projects
                      .filter((project) => project?.imageUrl)
                      .slice(0, 8)
                      .map((project) => ({
                      id: project.id || project._id,
                      src: resolveUrl(project.imageUrl),
                      title: project.title,
                      category: project.category || "General",
                      description: project.description,
                      status: project.status || "In Progress",
                      ...project,
                    }))}
                    imageWidth={300}
                    imageHeight={420}
                    spacing={8}
                    speed={3.2}
                    direction="right"
                    drag={true}
                    sensitivity={5}
                    tilt={-9}
                    perspective={2400}
                    cornerRadius={28}
                    innerDim={4.2}
                    background="#05070d"
                    onSelect={(item) => setSelectedProject(item)}
                  />
                </div>
              </div>
            </AnimatedItem>
          )}

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {projects.map((project: any) => (
              <AnimatedItem key={project.id || project._id}>
                <div
                  onClick={() => setSelectedProject(project)}
                  className="card-surface group flex flex-col h-full overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl rounded-3xl border border-white/15 bg-[#0f0f1b]/80 backdrop-blur-xl cursor-pointer"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                    {project.imageUrl && (
                      <img
                        src={resolveUrl(project.imageUrl)}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <EyebrowBadge>{td(project.category || "General")}</EyebrowBadge>
                      <span className={`font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border ${project.status === 'Live' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                        {td(project.status || "In Progress")}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white font-display mb-2">{td(project.title)}</h3>
                    <p className="text-xs sm:text-sm text-muted font-sans mb-6 flex-1 line-clamp-3 leading-relaxed">
                      {td(project.description)}
                    </p>
                    <span className="text-accent font-mono text-xs uppercase tracking-widest inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      {td("BATAFSIL KO'RISH →")}
                    </span>
                  </div>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </AnimatedSection>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card-surface w-full max-w-2xl p-6 sm:p-8 relative rounded-3xl border border-accent/40 bg-[#0f0f1b]/95 backdrop-blur-2xl shadow-[0_25px_70px_-10px_rgba(244,201,93,0.35)] my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 text-white hover:bg-accent hover:text-black flex items-center justify-center transition-colors z-20"
              >
                <X size={18} />
              </button>

              {/* Cover Image */}
              {selectedProject.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 mb-6 bg-black/60">
                  <img
                    src={resolveUrl(selectedProject.imageUrl)}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Meta info */}
              <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                <span className="font-mono text-xs text-accent uppercase tracking-widest bg-accent/10 border border-accent/20 px-3 py-1 rounded-full">
                  {td(selectedProject.category || "General")}
                </span>
                <span className={`font-mono text-xs uppercase tracking-widest px-3 py-1 rounded-full border ${selectedProject.status === 'Live' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                  {td(selectedProject.status || "In Progress")}
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-3">
                {td(selectedProject.title)}
              </h2>
              <p className="text-sm sm:text-base text-foreground/90 font-sans leading-relaxed whitespace-pre-wrap mb-6">
                {td(selectedProject.description)}
              </p>

              {/* Technologies */}
              {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-mono text-xs text-muted uppercase tracking-wider mb-2">
                    {td("Texnologiyalar")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech: string) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl font-mono text-xs text-foreground/80"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                {selectedProject.liveUrl && (
                  <a
                    href={selectedProject.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[140px] py-3 text-center font-mono text-xs uppercase tracking-widest bg-accent text-accent-foreground font-bold hover:bg-accent/90 transition-all rounded-xl shadow-[0_0_20px_rgba(244,201,93,0.4)] flex items-center justify-center gap-2"
                  >
                    <Globe size={16} /> {td("JONLI DEMO ↗")}
                  </a>
                )}
                {selectedProject.githubUrl && (
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[140px] py-3 text-center font-mono text-xs uppercase tracking-widest border border-white/20 text-white hover:border-accent hover:text-accent transition-colors rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <GithubLogo size={16} weight="fill" /> GitHub
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
