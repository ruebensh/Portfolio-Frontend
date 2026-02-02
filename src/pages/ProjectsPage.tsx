import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "../lib/router";
import { ArrowRight, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const projectImages = [
  "https://images.unsplash.com/photo-1660165458059-57cfb6cc87e5?q=80&w=1080",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1080",
  "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=1080",
  "https://images.unsplash.com/photo-1519662978799-2f05096d3636?q=80&w=1080",
  "https://images.unsplash.com/photo-1737114666907-4b2c8591398e?q=80&w=1080",
];

function SoftProjectsBackground() {
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
    const starCount = Math.floor(Math.min(520, Math.max(260, (w * h) / 2600)));
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.pow(Math.random(), 1.7),
      r: 0.25 + Math.random() * 0.9,
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
      g.addColorStop(0.25, `rgba(255,255,255,${a * 0.25})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, a * 0.75)})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.6, r), 0, Math.PI * 2);
      ctx.fill();
    };

    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      const m = mouseRef.current;
      m.tx += (m.x - m.tx) * 0.06;
      m.ty += (m.y - m.ty) * 0.06;

      const bg = ctx.createRadialGradient(
        w * 0.55 + m.tx * 70,
        h * 0.25 + m.ty * 55,
        Math.min(w, h) * 0.18,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.95
      );
      bg.addColorStop(0, "rgba(255,255,255,0.010)");
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      for (const st of stars) {
        if (!prefersReduced) {
          st.y += (0.02 + st.z * 0.08) * 0.55;
          if (st.y > h + 30) st.y = -30;
        }

        const tw = prefersReduced ? 1 : 0.86 + 0.14 * Math.sin(t * 0.0011 * st.tw + st.p);
        const alpha = Math.min(0.22, (0.09 + st.z * 0.22) * tw);
        const r = st.r * (0.75 + st.z * 0.85);

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
        .pp-aurora {
          opacity: .26;
          filter: blur(95px);
          background:
            radial-gradient(45% 45% at 15% 20%, rgba(99,102,241,.18), transparent 60%),
            radial-gradient(45% 45% at 85% 25%, rgba(168,85,247,.12), transparent 60%),
            radial-gradient(60% 60% at 50% 85%, rgba(56,189,248,.09), transparent 65%);
          animation: ppAurora 18s ease-in-out infinite alternate;
          transform: translateZ(0);
        }
        @keyframes ppAurora {
          0%   { transform: translate3d(-2%, -1%, 0) scale(1); }
          100% { transform: translate3d( 2%,  1%, 0) scale(1.06); }
        }

        .pp-noise {
          opacity: .06;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
        }

        .pp-vignette {
          background:
            radial-gradient(70% 60% at 50% 20%, rgba(255,255,255,.03), transparent 60%),
            radial-gradient(95% 95% at 50% 50%, transparent, rgba(0,0,0,.74));
        }

        .pp-glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 20px 80px rgba(0,0,0,.35);
        }

        .pp-title {
          background: linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,.65), rgba(255,255,255,1));
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: ppTitleSheen 4.2s ease-in-out infinite;
        }
        @keyframes ppTitleSheen {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pp-aurora, .pp-title { animation: none; }
        }
      `}</style>

      <div className="absolute inset-0 pp-aurora" />
      <div className="absolute inset-0 pp-noise" />
      <div className="absolute inset-0 pp-vignette" />
      <canvas ref={canvasRef} className="absolute inset-0 opacity-80" />
    </div>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "Live":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "In Progress":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    default:
      return "bg-white/5 text-muted-foreground border-white/10";
  }
};

export function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/projects`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Backend ulanishda xato:", err);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(projects.map((p) => p.category || "General")));
    return ["All", ...unique];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      return selectedCategory === "All" || project.category === selectedCategory;
    });
  }, [projects, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020202]">
        <SoftProjectsBackground />
        <div className="pp-glass rounded-2xl px-8 py-6 flex items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={22} />
          <span className="text-sm text-muted-foreground">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#020202] text-foreground relative">
      <SoftProjectsBackground />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <div className="pp-glass rounded-3xl p-8 md:p-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_18px_rgba(99,102,241,.55)]" />
              <span className="text-xs md:text-sm text-muted-foreground">
                Explore {projects.length} projects
              </span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-4 pp-title">
              All Projects
            </h1>

            <p className="text-muted-foreground text-lg max-w-3xl">
              Proyektlar bilan tanishib chiqishingiz mumkin
            </p>

            {}
            <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border
                      ${
                        active
                          ? "bg-primary/15 text-foreground border-primary/30"
                          : "bg-white/5 hover:bg-white/10 border-white/10 text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {cat}
                    {active && (
                      <motion.span
                        layoutId="activeChip"
                        className="absolute inset-0 rounded-full border border-primary/25 shadow-[0_0_30px_rgba(99,102,241,.20)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => {
              const img = project.imageUrl
                ? project.imageUrl.startsWith("http")
                  ? project.imageUrl
                  : `${API_URL}${project.imageUrl}`
                : projectImages[index % projectImages.length];

              return (
                <motion.div
                  key={project.id || `${project.title}-${index}`}
                  variants={item}
                  layout
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link href={`/project/${project.id}`}>
                    <div className="group h-full rounded-3xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/7 transition-all duration-300 shadow-[0_18px_80px_rgba(0,0,0,.40)]">
                      {}
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={img}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/1200x630/0b1220/ffffff?text=Project";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                        {}
                        <div className="absolute top-4 right-4">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${getStatusClass(
                              project.status || "Live"
                            )}`}
                          >
                            {project.status || "Live"}
                          </div>
                        </div>
                      </div>

                      {}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>

                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {project.description}
                        </p>

                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            View Details
                          </span>
                          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                            Open
                            <ArrowRight
                              size={14}
                              className="group-hover:translate-x-1 transition-transform"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="pp-glass rounded-3xl p-10 inline-block">
              <p className="text-muted-foreground text-lg">
                Bu kategoriyada hozircha loyiha yo‘q.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Balki boshqa kategoriya tanlaymiz? 😄
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
