import React from "react";
import { getProjectById } from "@/lib/api";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { EyebrowBadge } from "@/components/ui/EyebrowBadge";
import { Button } from "@/components/ui/Button";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id) as any;
  if (!project) notFound();

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto p-6 sm:p-10 md:p-12 rounded-3xl border border-card-border/80 bg-card-bg/60 backdrop-blur-xl shadow-2xl">
        <AnimatedSection>
          <AnimatedItem>
            <Link href="/projects" className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors mb-8 font-mono text-xs">
              ← Barcha loyihalarga qaytish
            </Link>

            <div className="flex flex-wrap gap-3 mb-5">
              <EyebrowBadge>{project.category || "General"}</EyebrowBadge>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${project.status === "Live" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"}`}>
                {project.status || "In Progress"}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 font-display text-foreground">{project.title}</h1>
          </AnimatedItem>

          {project.imageUrl && (
            <AnimatedItem className="mb-10">
              <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-black/60 shadow-xl border border-white/10">
                <Image src={project.imageUrl} alt={project.title} fill className="object-cover" priority />
              </div>
            </AnimatedItem>
          )}

          <AnimatedItem>
            <div className="card-surface p-8 md:p-12 mb-8">
              <h2 className="text-2xl font-bold mb-4 font-display text-foreground">Loyiha haqida</h2>
              <p className="text-base text-foreground/90 leading-relaxed whitespace-pre-wrap font-sans">{project.description}</p>

              {/* Technologies */}
              {project.technologies?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-3">Texnologiyalar</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech: string) => (
                      <span key={tech} className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-mono text-foreground/80">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action links */}
              <div className="mt-10 flex flex-wrap gap-4">
                {project.liveUrl && (
                  <Button href={project.liveUrl} showArrow>
                    Jonli Ko'rish ↗
                  </Button>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl card-surface-nested border border-card-border text-foreground text-xs font-mono uppercase tracking-widest hover:border-accent hover:text-accent transition-all shadow-sm"
                  >
                    <GithubLogo size={18} weight="fill" /> GitHub
                  </a>
                )}
              </div>
            </div>
          </AnimatedItem>
        </AnimatedSection>
      </div>
    </main>
  );
}
