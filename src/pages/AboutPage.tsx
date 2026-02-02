import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Award,
  Heart,
  Code,
  BookOpen,
  Loader2,
  Sparkles,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/** ===== Soft cosmic background (subtle, not distracting) ===== */
function SoftAboutBackground() {
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

    type Star = {
      x: number;
      y: number;
      z: number;
      r: number;
      p: number;
      tw: number;
    };

    const starCount = Math.floor(Math.min(520, Math.max(240, (w * h) / 2800)));
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.pow(Math.random(), 1.65),
      r: 0.22 + Math.random() * 0.85,
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

      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, a * 0.70)})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.6, r), 0, Math.PI * 2);
      ctx.fill();
    };

    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      const m = mouseRef.current;
      m.tx += (m.x - m.tx) * 0.06;
      m.ty += (m.y - m.ty) * 0.06;

      // subtle glow wash
      const bg = ctx.createRadialGradient(
        w * 0.55 + m.tx * 70,
        h * 0.22 + m.ty * 55,
        Math.min(w, h) * 0.16,
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
          st.y += (0.018 + st.z * 0.07) * 0.55;
          if (st.y > h + 30) st.y = -30;
        }

        const tw = prefersReduced ? 1 : 0.86 + 0.14 * Math.sin(t * 0.0011 * st.tw + st.p);
        const alpha = Math.min(0.20, (0.085 + st.z * 0.20) * tw);
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
        .ab-aurora {
          opacity: .22;
          filter: blur(100px);
          background:
            radial-gradient(45% 45% at 12% 20%, rgba(99,102,241,.18), transparent 60%),
            radial-gradient(45% 45% at 88% 24%, rgba(168,85,247,.12), transparent 60%),
            radial-gradient(65% 65% at 50% 88%, rgba(56,189,248,.09), transparent 65%);
          animation: abAurora 18s ease-in-out infinite alternate;
          transform: translateZ(0);
        }
        @keyframes abAurora {
          0%   { transform: translate3d(-2%, -1%, 0) scale(1); }
          100% { transform: translate3d( 2%,  1%, 0) scale(1.06); }
        }

        .ab-noise {
          opacity: .06;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
        }

        .ab-vignette {
          background:
            radial-gradient(70% 60% at 50% 20%, rgba(255,255,255,.03), transparent 60%),
            radial-gradient(95% 95% at 50% 50%, transparent, rgba(0,0,0,.74));
        }

        .ab-glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 20px 85px rgba(0,0,0,.38);
        }

        .ab-title {
          background: linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,.65), rgba(255,255,255,1));
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: abTitleSheen 4.2s ease-in-out infinite;
        }
        @keyframes abTitleSheen {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .ab-chip {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        @media (prefers-reduced-motion: reduce) {
          .ab-aurora, .ab-title { animation: none; }
        }
      `}</style>

      <div className="absolute inset-0 ab-aurora" />
      <div className="absolute inset-0 ab-noise" />
      <div className="absolute inset-0 ab-vignette" />
      <canvas ref={canvasRef} className="absolute inset-0 opacity-80" />
    </div>
  );
}

const sectionWrap = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};

const sectionItem = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

function safeArray(v: any) {
  return Array.isArray(v) ? v : [];
}

export function AboutPage() {
  const [data, setData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/about`).then((res) => res.json()),
      fetch(`${API_URL}/settings`).then((res) => res.json()),
    ])
      .then(([aboutData, settingsData]) => {
        setData(aboutData);
        setSettings(settingsData);
      })
      .catch((err) => console.error("Xatolik:", err))
      .finally(() => setLoading(false));
  }, []);

  const getAvatarUrl = () => {
    if (!settings?.avatarUrl) return "https://via.placeholder.com/600x600.png?text=Avatar";
    if (settings.avatarUrl.startsWith("http")) return settings.avatarUrl;
    return `${API_URL}${settings.avatarUrl}`;
  };

  const content = useMemo(() => {
    const fallback = {
      story: "",
      education: [],
      certificates: [],
      values: [],
      currentlyLearning: [],
      currentlyWorking: [],
    };
    return data || fallback;
  }, [data]);

  const education = safeArray(content.education);
  const certificates = safeArray(content.certificates);
  const values = safeArray(content.values);
  const currentlyLearning = safeArray(content.currentlyLearning);
  const currentlyWorking = safeArray(content.currentlyWorking);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020202]">
        <SoftAboutBackground />
        <div className="ab-glass rounded-2xl px-8 py-6 flex items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={22} />
          <span className="text-sm text-muted-foreground">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#020202] text-foreground relative">
      <SoftAboutBackground />

      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Header / Intro */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <div className="ab-glass rounded-3xl p-8 md:p-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full ab-chip mb-6">
              <Sparkles size={16} className="text-primary" />
              <span className="text-xs md:text-sm text-muted-foreground">
                Men haqimda:
              </span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-4 ab-title">
              About Me
            </h1>

            <p className="text-muted-foreground text-lg max-w-3xl">
              Tanishing bu men
            </p>
          </div>
        </motion.div>

        {/* Avatar + Story */}
        <motion.div
          variants={sectionWrap}
          initial="hidden"
          animate="show"
          className="mb-12"
        >
          <motion.div variants={sectionItem} className="ab-glass rounded-3xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="absolute -inset-6 rounded-[28px] bg-gradient-to-br from-primary/25 via-purple-500/10 to-sky-400/10 blur-2xl opacity-80" />
                <motion.img
                  src={getAvatarUrl()}
                  alt={settings?.author || "Jaloliddin"}
                  className="relative w-44 h-44 md:w-52 md:h-52 rounded-[28px] object-cover border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,.50)]"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>

              {/* Story */}
              <div className="flex-1 w-full">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    {settings?.author || "Jaloliddin"}
                  </h2>
                  <p className="text-muted-foreground">
                    {settings?.subtitle || "Ai Engineer & Developer"}
                  </p>
                </div>

                <div className="mt-6">
                  {(content.story || "")
                    .split("\n\n")
                    .filter(Boolean)
                    .map((paragraph: string, idx: number) => (
                      <p
                        key={idx}
                        className="text-muted-foreground leading-relaxed mb-4 text-center md:text-left"
                      >
                        {paragraph}
                      </p>
                    ))}

                  {!content.story && (
                    <p className="text-muted-foreground italic text-center md:text-left">
                      Hozircha story yozilmagan. Admin paneldan kiritib qo‘ysang — bu joy “wow” bo‘ladi.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8">
          {/* Education */}
          <motion.section variants={sectionWrap} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-90px" }}>
            <motion.div variants={sectionItem} className="ab-glass rounded-3xl p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-white/10 flex items-center justify-center">
                  <GraduationCap className="text-primary" size={20} />
                </div>
                <h2 className="text-2xl font-bold">Education</h2>
              </div>

              <div className="space-y-4">
                {education.length ? (
                  education.map((edu: any, index: number) => (
                    <motion.div
                      key={index}
                      variants={sectionItem}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/7 transition-colors p-6"
                    >
                      <h3 className="font-semibold mb-1">{edu.degree}</h3>
                      <p className="text-muted-foreground text-sm">
                        {edu.institution} • {edu.year}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">Education ma’lumotlari yo‘q.</p>
                )}
              </div>
            </motion.div>
          </motion.section>

          {/* Certificates */}
          <motion.section variants={sectionWrap} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-90px" }}>
            <motion.div variants={sectionItem} className="ab-glass rounded-3xl p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-white/10 flex items-center justify-center">
                  <Award className="text-primary" size={20} />
                </div>
                <h2 className="text-2xl font-bold">Certificates</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.length ? (
                  certificates.map((cert: any, index: number) => (
                    <motion.div
                      key={index}
                      variants={sectionItem}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/7 transition-colors p-6"
                    >
                      <h3 className="font-semibold mb-1">{cert.name}</h3>
                      <p className="text-muted-foreground text-sm">
                        {cert.issuer} • {cert.year}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic md:col-span-2">
                    Certificates yo‘q.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.section>

          {/* Values */}
          <motion.section variants={sectionWrap} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-90px" }}>
            <motion.div variants={sectionItem} className="ab-glass rounded-3xl p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-white/10 flex items-center justify-center">
                  <Heart className="text-primary" size={20} />
                </div>
                <h2 className="text-2xl font-bold">Values & Principles</h2>
              </div>

              <div className="space-y-4">
                {values.length ? (
                  values.map((v: any, index: number) => (
                    <motion.div
                      key={index}
                      variants={sectionItem}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/7 transition-colors p-6 flex items-start gap-4"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0 shadow-[0_0_18px_rgba(99,102,241,.35)]" />
                      <p className="text-muted-foreground">{v.text}</p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">Values yo‘q.</p>
                )}
              </div>
            </motion.div>
          </motion.section>

          {/* Learning & Working */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.section variants={sectionWrap} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-90px" }}>
              <motion.div variants={sectionItem} className="ab-glass rounded-3xl p-8 md:p-10 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-white/10 flex items-center justify-center">
                    <BookOpen className="text-primary" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold">Currently Learning</h2>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <ul className="space-y-3">
                    {currentlyLearning.length ? (
                      currentlyLearning.map((item: any, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground text-sm">{item.text}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground italic text-sm">
                        Hozircha learning ro‘yxati yo‘q.
                      </li>
                    )}
                  </ul>
                </div>
              </motion.div>
            </motion.section>

            <motion.section variants={sectionWrap} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-90px" }}>
              <motion.div variants={sectionItem} className="ab-glass rounded-3xl p-8 md:p-10 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-white/10 flex items-center justify-center">
                    <Code className="text-primary" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold">Currently Working On</h2>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <ul className="space-y-3">
                    {currentlyWorking.length ? (
                      currentlyWorking.map((item: any, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground text-sm">{item.text}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground italic text-sm">
                        Hozircha working ro‘yxati yo‘q.
                      </li>
                    )}
                  </ul>
                </div>
              </motion.div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}
