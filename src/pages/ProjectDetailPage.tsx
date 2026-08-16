import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useRouter, Link } from "../lib/router";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import NeonGlowButton from "../components/originkit/ui/neon-glow-button";
import { useLanguage } from "../context/LanguageContext";

import { usePerformance } from "../context/PerformanceContext";
import { SubtleVideoBackground } from "../components/SubtleVideoBackground";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function SoftProjectBackground() {
  const { tier } = usePerformance();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <SubtleVideoBackground index={0} />
      <style>{`
        .pd-aurora {
          opacity: ${tier === "low" ? "0.1" : tier === "medium" ? "0.18" : "0.28"};
          filter: blur(90px);
          background:
            radial-gradient(45% 45% at 15% 25%, rgba(99,102,241,.18), transparent 60%),
            radial-gradient(45% 45% at 85% 30%, rgba(168,85,247,.12), transparent 60%),
            radial-gradient(55% 55% at 50% 80%, rgba(56,189,248,.08), transparent 65%);
          animation: pdAurora 16s ease-in-out infinite alternate;
          transform: translateZ(0);
        }
        @keyframes pdAurora {
          0%   { transform: translate3d(-2%, -1%, 0) scale(1); }
          100% { transform: translate3d( 2%,  1%, 0) scale(1.06); }
        }

        .pd-noise {
          opacity: .06;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
        }

        .pd-vignette {
          background:
            radial-gradient(70% 60% at 50% 20%, rgba(255,255,255,.03), transparent 60%),
            radial-gradient(95% 95% at 50% 50%, transparent, rgba(0,0,0,.72));
        }

        /* Premium surface helpers */
        .pd-glass {
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%);
          border: 1px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(24px) saturate(1.5);
          -webkit-backdrop-filter: blur(24px) saturate(1.5);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.18),
            inset 0 -1px 0 rgba(0,0,0,0.1),
            0 25px 60px rgba(0,0,0,0.45),
            0 0 0 1px rgba(255,255,255,0.04);
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .pd-glass:hover {
          border-color: rgba(255,255,255,0.26);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.25),
            inset 0 -1px 0 rgba(0,0,0,0.1),
            0 30px 70px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.06);
        }

        .pd-sheen {
          position: relative;
          overflow: hidden;
        }
        .pd-sheen::after {
          content: "";
          position: absolute;
          inset: -40%;
          background: linear-gradient(120deg, transparent 35%, rgba(255,255,255,.16) 50%, transparent 65%);
          transform: translateX(-120%);
          transition: transform 700ms ease;
        }
        .pd-sheen:hover::after { transform: translateX(120%); }

        .pd-title {
          background: linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,.65), rgba(255,255,255,1));
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: pdTitleSheen 4.2s ease-in-out infinite;
        }
        @keyframes pdTitleSheen {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pd-aurora, .pd-title { animation: none; }
        }
      `}</style>

      <div className="absolute inset-0 pd-aurora" />
      <div className="absolute inset-0 pd-noise" />
      <div className="absolute inset-0 pd-vignette" />
    </div>
  );
}

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function ProjectDetailPage() {
  const { params } = useRouter();
  const { t, td } = useLanguage();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`${API_URL}/projects`);
        const data = await response.json();
        const found = data.find(
          (p: any) => String(p.id) === params.slug || String(p.id) === params.id
        );
        setProject(found);
      } catch (error) {
        console.error("Xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.slug, params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020202]">
        <SoftProjectBackground />
        <div className="pd-glass rounded-2xl px-8 py-6 flex items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={22} />
          <span className="text-sm text-muted-foreground">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-[#020202] text-foreground">
        <SoftProjectBackground />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4 pd-title"
          >
            Loyiha topilmadi
          </motion.h1>
          <p className="text-muted-foreground mb-8">
            Siz qidirayotgan loyiha bazada mavjud emas.
          </p>
          <Link href="/projects">
            <Button className="pd-sheen">Loyihalarga qaytish</Button>
          </Link>
        </div>
      </div>
    );
  }

  const projectLink = project.liveUrl || project.link;
  const repoLink = project.githubUrl || project.repoUrl || project.github || null;
  const safeHttp = (url: string) => (url.startsWith("http") ? url : `https://${url}`);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#020202] text-foreground relative">
      <SoftProjectBackground />

      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={18} /> {t("projectDetail.back")}
          </Link>
        </motion.div>

        <Reveal>
          <div className="pd-glass rounded-3xl p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="secondary" className="px-3 py-1">
                {td(project.category || "Web Development")}
              </Badge>

              <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                {td(project.status || "Live")}
              </div>

              {project.tech && (
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-muted-foreground border border-white/10">
                  {String(project.tech)}
                </div>
              )}
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 pd-title"
            >
              {td(project.title)}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl"
            >
              {td(project.description) || t("projectDetail.noDesc")}
            </motion.p>

            <div className="mt-8 flex flex-wrap gap-4 items-center">
              {projectLink && (
                <NeonGlowButton
                  label={t("projectDetail.viewLive")}
                  link={safeHttp(projectLink)}
                  newTab={true}
                  colors={{ fill: "#09090b", hoverFill: "#18181b", textColor: "#FFFFFF", hoverTextColor: "#00FFEE" }}
                  glow={{ color: "#00FFEE", size: 6, blur: 6 }}
                  border={{ borderWidth: 1, borderColor: "rgba(0,255,238,0.5)" }}
                  addIcon={true}
                  icon={{ symbol: "↗", size: 16, color: "#00FFEE" }}
                  rounded={16}
                  padding="12px 24px"
                  gap={8}
                  font={{ fontSize: 14, fontWeight: 700 }}
                />
              )}

              {repoLink && (
                <NeonGlowButton
                  label={t("projectDetail.github")}
                  link={safeHttp(repoLink)}
                  newTab={true}
                  colors={{ fill: "#09090b", hoverFill: "#18181b", textColor: "#FFFFFF", hoverTextColor: "#A855F7" }}
                  glow={{ color: "#A855F7", size: 6, blur: 6 }}
                  border={{ borderWidth: 1, borderColor: "rgba(168,85,247,0.5)" }}
                  addIcon={true}
                  icon={{ symbol: "⚙", size: 16, color: "#A855F7" }}
                  rounded={16}
                  padding="12px 24px"
                  gap={8}
                  font={{ fontSize: 14, fontWeight: 700 }}
                />
              )}
            </div>
          </div>
        </Reveal>

        {}
        <Reveal delay={0.06}>
          <div className="mt-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-[28px] overflow-hidden border border-white/10 bg-white/5 shadow-[0_30px_120px_rgba(0,0,0,.55)]"
            >
              {}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-black/[0.35]" />

              <div className="relative aspect-video flex items-center justify-center">
                {project.imageUrl ? (
                  <img
                    src={
                      project.imageUrl.startsWith("http")
                        ? project.imageUrl
                        : `${API_URL}${project.imageUrl}`
                    }
                    alt={project.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/1200x630/0b1220/ffffff?text=Loyiha+Rasmi";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground py-16">
                    <ImageIcon size={56} />
                    <p className="text-sm">Rasm mavjud emas</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </Reveal>

        {}
        <Reveal delay={0.08}>
          <div className="mt-10 pd-glass rounded-3xl p-7 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Turkum
                </h4>
                <p className="text-lg font-medium">{project.category || "Portfolio"}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Holat
                </h4>
                <p className="text-lg font-medium">
                  {project.status || "Muvaffaqiyatli yakunlangan"}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Havola
                </h4>
                {projectLink ? (
                  <a
                    href={safeHttp(projectLink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline break-all"
                  >
                    {projectLink}
                  </a>
                ) : (
                  <p className="text-muted-foreground italic">Mavjud emas</p>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
