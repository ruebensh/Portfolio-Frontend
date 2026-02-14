import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ExternalLink, Award, Calendar, Building2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ProjectsPage dagi interaktiv fon komponenti
function SoftCertificatesBackground() {
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
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 25, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export function CertificatesPage() {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/certificates`)
      .then((res) => res.json())
      .then((data) => {
        // Achievement modelidan kelayotgan ma'lumotlarni massiv ekanligini tekshiramiz
        setCerts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Backend ulanishda xato:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020202]">
        <SoftCertificatesBackground />
        <div className="pp-glass rounded-2xl px-8 py-6 flex items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={22} />
          <span className="text-sm text-muted-foreground">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#020202] text-foreground relative overflow-hidden">
      <SoftCertificatesBackground />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <div className="pp-glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Award size={120} className="text-white" />
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_18px_rgba(99,102,241,.55)]" />
              <span className="text-xs md:text-sm text-muted-foreground">
                Verified Achievements: {certs.length}
              </span>
            </div>

            <h1 className="text-4xl lg:text-7xl font-extrabold tracking-tight mb-6 pp-title">
              Certificates
            </h1>

            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              Mening o'qib-o'rganishlarim, kurslar va professional faoliyatim davomida qo'lga kiritgan maxsus yutuqlarim to'plami.
            </p>
          </div>
        </motion.div>

        {/* Certificates Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {certs.map((cert, index) => {
              const isPdf = cert.fileUrl?.toLowerCase().endsWith(".pdf");
              const fileUrl = cert.fileUrl?.startsWith("http") 
                ? cert.fileUrl 
                : `${API_URL}${cert.fileUrl}`;

              return (
                <motion.div
                  key={cert.id || index}
                  variants={item}
                  layout
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="group h-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/5 hover:bg-white/7 transition-all duration-500 shadow-[0_25px_100px_rgba(0,0,0,.5)] flex flex-col">
                    
                    {/* Media Preview */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
                      {isPdf ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-zinc-800 to-black">
                          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20 group-hover:scale-110 transition-transform duration-500">
                            <span className="text-red-500 font-black text-2xl">PDF</span>
                          </div>
                          <span className="text-xs text-zinc-500 font-medium tracking-widest uppercase">Document</span>
                        </div>
                      ) : (
                        <img
                          src={fileUrl}
                          alt={cert.title}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/800x600/111/fff?text=Certificate";
                          }}
                        />
                      )}
                      
                      {/* Date Overlay */}
                      <div className="absolute top-4 left-4">
                        <div className="px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2">
                          <Calendar size={14} className="text-primary" />
                          <span className="text-xs font-bold text-white/90">{cert.date}</span>
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Content Section */}
                    <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold mb-4 line-clamp-2 text-white group-hover:text-primary transition-colors">
                        {cert.title}
                      </h3>

                      <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                            <Building2 size={14} className="text-primary" />
                          </div>
                          <span className="text-sm font-medium">{cert.issuer}</span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-primary hover:border-primary text-white transition-all duration-300 font-bold group/btn"
                        >
                          {isPdf ? "Open Document" : "Full Preview"}
                          <ExternalLink size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {certs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32"
          >
            <div className="pp-glass rounded-[3rem] p-16 inline-block">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10">
                <Award size={40} className="text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground text-xl font-medium">
                Hozircha sertifikatlar yuklanmagan.
              </p>
              <p className="text-muted-foreground/60 text-sm mt-3">
                Tez orada yangi yutuqlar shu yerda paydo bo'ladi! ✨
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}