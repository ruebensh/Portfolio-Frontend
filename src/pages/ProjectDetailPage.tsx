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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/** ===== Soft Premium Background (subtle cosmic) ===== */
function SoftProjectBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    type Star = { x: number; y: number; z: number; r: number; p: number; tw: number };
    const starCount = Math.floor(Math.min(420, Math.max(220, (w * h) / 3000)));
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.pow(Math.random(), 1.8),
      r: 0.25 + Math.random() * 0.85,
      p: Math.random() * Math.PI * 2,
      tw: 0.35 + Math.random() * 0.9,
    }));

    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      mouseRef.current.x = nx;
      mouseRef.current.y = ny;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const glowDot = (x: number, y: number, r: number, a: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 7);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(0.2, `rgba(255,255,255,${a * 0.25})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, a * 0.85)})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.6, r), 0, Math.PI * 2);
      ctx.fill();
    };

    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      const m = mouseRef.current;
      m.tx += (m.x - m.tx) * 0.06;
      m.ty += (m.y - m.ty) * 0.06;

      // Very subtle vignette glow
      const bg = ctx.createRadialGradient(
        w * 0.55 + m.tx * 60,
        h * 0.25 + m.ty * 40,
        Math.min(w, h) * 0.18,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.9
      );
      bg.addColorStop(0, "rgba(255,255,255,0.010)");
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Stars (slow drift)
      for (const st of stars) {
        if (!prefersReduced) {
          st.y += (0.02 + st.z * 0.08) * 0.55;
          if (st.y > h + 30) st.y = -30;
        }

        const twinkle = prefersReduced
          ? 1
          : 0.85 + 0.15 * Math.sin(t * 0.0011 * st.tw + st.p);

        const alpha = Math.min(0.22, (0.10 + st.z * 0.22) * twinkle);
        const r = st.r * (0.7 + st.z * 0.9);

        const px = st.x + m.tx * (st.z - 0.15) * 12;
        const py = st.y + m.ty * (st.z - 0.15) * 10;

        glowDot(px, py, r, alpha);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <style>{`
        .pd-aurora {
          opacity: .28;
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
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 20px 80px rgba(0,0,0,.35);
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
      <canvas ref={canvasRef} className="absolute inset-0 opacity-80" />
    </div>
  );
}

/** Fancy reveal wrapper */
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
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`${API_URL}/projects`);
        const data = await response.json();

        // Backend id-ni number yoki string qaytarishi mumkin, shuning uchun String() ishlatamiz
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

  // Backenddan keladigan liveUrl-ni tekshirish
  const projectLink = project.liveUrl || project.link;

  // optional repo url (backend o'zgarmaydi — bo'lsa ishlatamiz)
  const repoLink = project.githubUrl || project.repoUrl || project.github || null;

  const safeHttp = (url: string) => (url.startsWith("http") ? url : `https://${url}`);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#020202] text-foreground relative">
      <SoftProjectBackground />

      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Back */}
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
            <ArrowLeft size={18} /> Orqaga qaytish
          </Link>
        </motion.div>

        {/* Hero block */}
        <Reveal>
          <div className="pd-glass rounded-3xl p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="secondary" className="px-3 py-1">
                {project.category || "Web Development"}
              </Badge>

              <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                {project.status || "Live"}
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
              {project.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl"
            >
              {project.description || "Ushbu loyiha haqida ma'lumot berilmagan."}
            </motion.p>

            <div className="mt-8 flex flex-wrap gap-3">
              {projectLink && (
                <a
                  href={safeHttp(projectLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="gap-2 px-8 pd-sheen">
                    <ExternalLink size={20} /> Loyihani ko'rish
                  </Button>
                </a>
              )}

              {repoLink && (
                <a href={safeHttp(repoLink)} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="gap-2 px-8 bg-white/5 border border-white/10 hover:bg-white/10 pd-sheen"
                  >
                    <Github size={20} /> GitHub
                  </Button>
                </a>
              )}
            </div>
          </div>
        </Reveal>

        {/* Image */}
        <Reveal delay={0.06}>
          <div className="mt-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-[28px] overflow-hidden border border-white/10 bg-white/5 shadow-[0_30px_120px_rgba(0,0,0,.55)]"
            >
              {/* subtle top sheen */}
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

        {/* Info grid */}
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
