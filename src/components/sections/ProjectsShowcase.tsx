"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ScrollScene } from "../core/ScrollScene";
import { FrameSequenceCanvas, FrameSequenceCanvasRef } from "../core/FrameSequenceCanvas";
import { useLanguage } from "@/context/LanguageContext";
import { resolveUrl } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, GithubLogo } from "@phosphor-icons/react/dist/ssr";

const TUNNEL_FRAME_COUNT = 97;

interface Project {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  status?: string;
  githubUrl?: string;
  liveUrl?: string;
  technologies?: string[];
  isFeatured?: boolean;
}

function normalizeProject(p: any): Project {
  return {
    id:          p.id ?? p.slug ?? String(Math.random()),
    title:       p.title ?? p.name ?? "Loyiha",
    description: p.description ?? p.short_description ?? "",
    imageUrl:    p.imageUrl ?? p.image_url ?? p.thumbnail ?? "",
    category:    p.category ?? p.type ?? "Loyiha",
    status:      p.status ?? "Live",
    githubUrl:   p.githubUrl ?? p.github_url ?? p.github ?? "",
    liveUrl:     p.liveUrl  ?? p.live_url  ?? p.url     ?? "",
    technologies: Array.isArray(p.technologies) ? p.technologies
                : (p.tech ? String(p.tech).split(",").map((t: string) => t.trim()) : []),
    isFeatured:  Boolean(p.isFeatured),
  };
}

const STATUS_STYLES: Record<string, string> = {
  "Live":        "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  "In Progress": "bg-amber-500/10  text-amber-400  border-amber-500/30",
  "Archived":    "bg-zinc-500/10   text-zinc-400   border-zinc-500/30",
};

// ── Project annotation card (displayed floating over desktop tunnel) ───────────
const ProjectAnnotationCard = ({ project, index, onSelect }: { project: Project; index: number; onSelect: (p: Project) => void }) => {
  const { td } = useLanguage();
  const status      = project.status ?? "Live";
  const statusClass = STATUS_STYLES[status] ?? STATUS_STYLES["Live"];

  return (
    <div
      onClick={() => onSelect(project)}
      className="card-surface p-6 rounded-3xl border border-accent/40 bg-card-bg/85 backdrop-blur-2xl transition-all duration-300 cursor-pointer hover:border-accent"
      style={{
        width: "min(390px, 90vw)",
        boxShadow: "0 25px 70px -10px rgba(244, 201, 93, 0.35), 0 0 50px rgba(0,0,0,0.95)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[10px] text-accent uppercase tracking-widest bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full">
          0{index + 1} • {td(project.category)}
        </span>
        <span className={`font-mono text-[10px] px-3 py-1 rounded-full border uppercase tracking-widest ${statusClass}`}>
          {td(status)}
        </span>
      </div>

      {project.imageUrl ? (
        <div className="relative w-full h-40 mb-4 overflow-hidden rounded-2xl border border-white/10 card-surface-nested">
          <img src={resolveUrl(project.imageUrl)} alt={project.title} className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500" />
        </div>
      ) : (
        <div className="w-full h-40 mb-4 card-surface-nested border border-white/10 rounded-2xl flex items-center justify-center">
          <span className="font-display text-3xl font-bold text-accent/30">{project.title[0]}</span>
        </div>
      )}

      <h3 className="font-display text-xl font-bold text-foreground mb-1 leading-tight">{td(project.title)}</h3>
      <p className="text-muted text-xs leading-relaxed line-clamp-2 mb-4 font-sans">{td(project.description)}</p>

      {project.technologies && project.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.technologies.slice(0, 4).map((t) => (
            <span key={t} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full font-mono text-[9px] text-foreground/70 uppercase">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <span className="flex-1 py-2.5 text-center font-mono text-[10px] uppercase tracking-widest bg-accent text-accent-foreground font-bold rounded-xl shadow-[0_0_15px_rgba(244,201,93,0.4)]">
          {td("BATAFSIL KO'RISH →")}
        </span>
      </div>
    </div>
  );
};

// ── Mobile 3D Rotating Cube Showcase Component (MD down) ────────────────────────
const Mobile3DCubeShowcase = ({ projects, onSelect }: { projects: Project[]; onSelect: (p: Project) => void }) => {
  const { td } = useLanguage();
  const cubeRef      = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Direct GPU-accelerated DOM animation loop (0 React re-renders, IntersectionObserver paused)
  useEffect(() => {
    let animId: number;
    let step = 0;
    let rotY = 0;
    let isVisible = true;

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const animate = () => {
      if (isVisible && cubeRef.current) {
        step += 0.012;
        rotY = (rotY + 0.45) % 360;
        const rotX = 12 + Math.sin(step) * 14;
        const rotZ = Math.cos(step * 0.6) * 8;

        cubeRef.current.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg)`;
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  // Ensure 6 faces exist
  const cubeProjects = [...projects];
  while (cubeProjects.length < 6) {
    cubeProjects.push(projects[cubeProjects.length % Math.max(1, projects.length)] || {
      id: `pad-${cubeProjects.length}`,
      title: "Loyiha",
      category: "AI & ML",
      description: "Sun'iy intellekt va dasturlash loyihasi",
    });
  }

  // 1:1 Cube Geometry (210px x 210px -> translateZ 105px)
  const CUBE_SIZE = 105;
  const faceTransforms = [
    `rotateY(0deg) translateZ(${CUBE_SIZE}px)`,     // Front
    `rotateY(90deg) translateZ(${CUBE_SIZE}px)`,    // Right
    `rotateY(180deg) translateZ(${CUBE_SIZE}px)`,   // Back
    `rotateY(-90deg) translateZ(${CUBE_SIZE}px)`,   // Left
    `rotateX(90deg) translateZ(${CUBE_SIZE}px)`,    // Top
    `rotateX(-90deg) translateZ(${CUBE_SIZE}px)`,   // Bottom
  ];

  return (
    <div ref={containerRef} className="flex flex-col items-center py-4">
      {/* 3D Viewport — 210px x 210px with mt-16 & mb-16 spacing */}
      <div
        className="relative w-[210px] h-[210px] mt-16 mb-16 select-none pointer-events-auto"
        style={{ perspective: "900px" }}
      >
        {/* 3D Rotating Cube Container */}
        <div
          ref={cubeRef}
          className="w-full h-full relative"
          style={{
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {cubeProjects.slice(0, 6).map((proj, idx) => (
            <div
              key={proj.id || idx}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(proj);
              }}
              className="absolute inset-0 w-[210px] h-[210px] p-3 rounded-2xl border-2 border-accent/80 bg-[#090914]/98 backdrop-blur-2xl shadow-[0_0_25px_rgba(244,201,93,0.35),inset_0_0_15px_rgba(244,201,93,0.15)] flex flex-col justify-between overflow-hidden cursor-pointer"
              style={{
                transform: faceTransforms[idx],
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[8px] text-accent font-bold uppercase tracking-wider bg-accent/15 border border-accent/40 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                  0{idx + 1} • {td(proj.category)}
                </span>
                <span className="font-mono text-[7.5px] text-emerald-400 border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase font-bold">
                  {td(proj.status || "Live")}
                </span>
              </div>

              {/* Image */}
              {proj.imageUrl ? (
                <div className="relative w-full h-18 my-1 rounded-lg overflow-hidden border border-accent/30 bg-black/60 shadow-inner">
                  <img src={resolveUrl(proj.imageUrl)} alt={proj.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-18 my-1 rounded-lg border border-accent/20 bg-accent/5 flex items-center justify-center font-display font-bold text-lg text-accent/50">
                  {proj.title?.[0] || "P"}
                </div>
              )}

              {/* Title & Desc */}
              <div className="min-h-0">
                <h4 className="font-display font-bold text-xs text-white truncate leading-tight">{td(proj.title)}</h4>
                <p className="text-[9px] text-muted line-clamp-1 font-sans mt-0.5 leading-none">{td(proj.description)}</p>
              </div>

              {/* Action Button */}
              <button className="w-full py-1.5 rounded-lg bg-accent text-black font-mono text-[8px] uppercase tracking-widest font-extrabold shadow-[0_0_12px_rgba(244,201,93,0.4)]">
                {td("BATAFSIL KO'RISH →")}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* View All Projects Button */}
      <a
        href="/projects"
        className="w-full max-w-xs py-3.5 rounded-2xl bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest font-bold text-center shadow-[0_0_25px_rgba(244,201,93,0.5)] hover:bg-accent/90 transition-all inline-block relative z-10"
      >
        {td("BARCHA LOYIHALARNI KO'RISH →")}
      </a>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
export const ProjectsShowcase = ({ projects = [] }: { projects?: any[] }) => {
  const { td } = useLanguage();
  const normalized = projects.map(normalizeProject);
  
  const featured = normalized.filter(p => p.isFeatured);
  const regular = normalized.filter(p => !p.isFeatured);
  const displayProjects = [...featured, ...regular].slice(0, 6);

  const canvasRef   = useRef<FrameSequenceCanvasRef>(null);
  const titleRef    = useRef<HTMLDivElement>(null);
  const cardRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleProgress = useCallback((progress: number) => {
    if (canvasRef.current) {
      canvasRef.current.drawProgress(progress);
    }

    if (titleRef.current) {
      let op = 0;
      if (progress >= 0.02 && progress <= 0.26) {
        op = progress < 0.07
          ? (progress - 0.02) / 0.05
          : progress > 0.20
            ? 1 - (progress - 0.20) / 0.06
            : 1;
      }
      titleRef.current.style.opacity = Math.max(0, op).toString();
      titleRef.current.style.transform = `translateY(${(1 - Math.max(0, op)) * 25}px)`;
    }

    const count = displayProjects.length;
    if (count > 0) {
      const startRange = 0.26;
      const endRange   = 0.93;
      const totalAvailable = endRange - startRange;
      const step = totalAvailable / count;
      const windowSize = step * 0.9;

      displayProjects.forEach((_, idx) => {
        const el = cardRefs.current[idx];
        if (!el) return;

        const startWindow = startRange + idx * step;
        const endWindow   = startWindow + windowSize;

        let op = 0;
        if (progress >= startWindow && progress <= endWindow) {
          const fadeIn = startWindow + windowSize * 0.25;
          const fadeOut = endWindow - windowSize * 0.25;

          if (progress < fadeIn) {
            op = (progress - startWindow) / (fadeIn - startWindow);
          } else if (progress > fadeOut) {
            op = 1 - (progress - fadeOut) / (endWindow - fadeOut);
          } else {
            op = 1;
          }
        }

        op = Math.max(0, Math.min(1, op));
        const sideOffset = (idx % 2 === 0 ? -1 : 1) * (1 - op) * 50;

        el.style.opacity = op.toString();
        el.style.transform = `translateX(${sideOffset}px)`;
      });
    }
  }, [displayProjects.length]);

  return (
    <>
      {/* Desktop 3D Tunnel Sequence (MD and up) */}
      <div className="hidden md:block">
        <ScrollScene height="700vh" onProgress={handleProgress} id="projects" className="bg-[#050505] text-white">
          {!isLoaded && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                {td("Yuklanmoqda...")}
              </span>
              <div className="w-24 h-0.5 bg-accent/20 overflow-hidden rounded-full">
                <div className="w-full h-full bg-accent animate-pulse" />
              </div>
            </div>
          )}

          <FrameSequenceCanvas
            ref={canvasRef}
            frameCount={TUNNEL_FRAME_COUNT}
            framePath={(idx) => `/tunnel-frames/frame_${String(idx).padStart(4, "0")}.jpg`}
            onLoaded={() => setIsLoaded(true)}
            className="opacity-75"
          />

          <div
            ref={titleRef}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
            style={{ opacity: 0 }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent border border-accent/20 bg-accent/10 px-4 py-1.5 rounded-full mb-4">
              {td("LOYIHALAR ARXIVI")}
            </span>
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-3 drop-shadow-2xl">
              {td("Men Yaratgan Arxitekturalar")}
            </h2>
            <p className="font-mono text-xs text-muted max-w-sm uppercase tracking-widest">
              {td("SCROLL QILIB KASHF ETING")}
            </p>
          </div>

          <div className="absolute inset-0 z-30 pointer-events-none">
            {displayProjects.map((proj, idx) => (
              <div
                key={proj.id}
                ref={(el) => { cardRefs.current[idx] = el; }}
                className={`absolute inset-0 flex items-center justify-center p-6 ${
                  idx % 2 === 0 ? "md:justify-start md:pl-20" : "md:justify-end md:pr-20"
                }`}
                style={{ opacity: 0, pointerEvents: "auto" }}
              >
                <ProjectAnnotationCard project={proj} index={idx} onSelect={setSelectedProject} />
              </div>
            ))}
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40">
            <a
              href="/projects"
              className="px-6 py-3 rounded-2xl bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(244,201,93,0.4)] hover:bg-accent/90 transition-all inline-block"
            >
              {td("BARCHA LOYIHALARNI KO'RISH →")}
            </a>
          </div>
        </ScrollScene>
      </div>

      {/* Mobile 3D Rotating Cube Showcase (MD down) */}
      <section className="block md:hidden py-14 px-5 bg-transparent overflow-hidden">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-accent border border-accent/20 bg-accent/10 px-3 py-1 rounded-full inline-block mb-3">
              {td("LOYIHALAR ARXIVI")}
            </span>
            <h2 className="font-display text-2xl font-bold text-white mb-1">
              {td("Men Yaratgan Arxitekturalar")}
            </h2>
          </div>

          <Mobile3DCubeShowcase projects={displayProjects} onSelect={setSelectedProject} />
        </div>
      </section>

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
              className="card-surface w-full max-w-2xl p-6 sm:p-8 relative rounded-3xl border border-accent/40 bg-[#0f0f1b]/95 backdrop-blur-2xl shadow-2xl my-8"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 text-white hover:bg-accent hover:text-black flex items-center justify-center transition-colors z-20"
              >
                <X size={18} />
              </button>

              {selectedProject.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 mb-6 bg-black/60">
                  <img src={resolveUrl(selectedProject.imageUrl)} alt={selectedProject.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                <span className="font-mono text-xs text-accent uppercase tracking-widest bg-accent/10 border border-accent/20 px-3 py-1 rounded-full">
                  {td(selectedProject.category || "General")}
                </span>
                <span className={`font-mono text-xs uppercase tracking-widest px-3 py-1 rounded-full border ${STATUS_STYLES[selectedProject.status || "Live"]}`}>
                  {td(selectedProject.status || "Live")}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-3">{td(selectedProject.title)}</h2>
              <p className="text-sm sm:text-base text-foreground/90 font-sans leading-relaxed whitespace-pre-wrap mb-6">{td(selectedProject.description)}</p>

              {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-mono text-xs text-muted uppercase tracking-wider mb-2">{td("Texnologiyalar")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((t) => (
                      <span key={t} className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl font-mono text-xs text-foreground/80">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
    </>
  );
};
