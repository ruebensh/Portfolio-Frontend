import { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles, FileText } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "../lib/router";

import { ProfileCard } from "../components/home/ProfileCard";
import { Skills } from "../components/home/Skills";
import { Experience } from "../components/home/Experience";
import { Contact } from "../components/home/Contact";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function PageBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const scrollRef = useRef({ y: 0, ty: 0 });

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
      tw: number;
      p: number;
    };

    type Meteor = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      w: number;
      z: number;
      r: number;
      hue: number;
      fadeIn: number;
    };

    const starCount = Math.floor(Math.min(700, Math.max(320, (w * h) / 2200)));
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.pow(Math.random(), 1.9),
      r: 0.28 + Math.random() * 1.05,
      tw: 0.25 + Math.random() * 0.95,
      p: Math.random() * Math.PI * 2,
    }));

    const meteors: Meteor[] = [];

    const spawnMeteor = () => {
      if (prefersReduced) return;

      if (Math.random() > 0.028) return;

      const z =
        Math.random() < 0.15
          ? 0.75 + Math.random() * 0.25
          : Math.pow(Math.random(), 2.2);

      const baseAngle = (Math.PI * 7) / 6;
      const angleJitter = 0.22 + (1 - z) * 0.18;
      const angle = baseAngle + (Math.random() - 0.5) * angleJitter;
      const speed = (10 + Math.random() * 6) * (0.65 + z * 1.25);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const trail = (210 + Math.random() * 260) * (0.55 + z * 1.15);
      const maxLife = (38 + Math.random() * 38) * (0.7 + z * 0.85);
      const r = (0.9 + Math.random() * 1.5) * (0.55 + z * 1.35);
      const hue = 200 + Math.random() * 40;
      const fadeIn = Math.floor(6 + Math.random() * 10 + z * 6);
      const entryX = Math.random() * w * 0.9 + w * 0.05;
      const entryY = Math.random() * h * 0.30 + h * 0.02;
      const margin = 220 + z * 220;
      const startX = entryX - vx * (margin / 10);
      const startY = entryY - vy * (margin / 10);

      meteors.push({
        x: startX,
        y: startY,
        vx,
        vy,
        life: 0,
        maxLife,
        w: trail,
        z,
        r,
        hue,
        fadeIn,
      });

      if (meteors.length > 8) meteors.shift();
    };

    const drawGlowStar = (x: number, y: number, radius: number, alpha: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius * 6);
      g.addColorStop(0, `rgba(255,255,255,${alpha})`);
      g.addColorStop(0.25, `rgba(255,255,255,${alpha * 0.3})`);
      g.addColorStop(1, `rgba(255,255,255,0)`);

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, radius * 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha * 1.05)})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.55, radius), 0, Math.PI * 2);
      ctx.fill();
    };

    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      mouseRef.current.x = nx;
      mouseRef.current.y = ny;
    };

    const onScroll = () => {
      scrollRef.current.y = window.scrollY || 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      ctx.globalCompositeOperation = "source-over";

      const m = mouseRef.current;
      m.tx += (m.x - m.tx) * 0.06;
      m.ty += (m.y - m.ty) * 0.06;
      const s = scrollRef.current;
      s.ty += (s.y - s.ty) * 0.14;
      const parallaxBase = 0.2;
      const parallax = s.ty * parallaxBase;
      const bg = ctx.createRadialGradient(
        w * 0.5 + m.tx * 60,
        h * 0.35 + m.ty * 40,
        Math.min(w, h) * 0.12,
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
          const starFall = 1.85;
          st.y += (0.02 + st.z * 0.12) * 0.6 * starFall;
          if (st.y > h + 40) st.y = -40;
        }

        const depth = 0.22 + st.z * 0.85;
        const twinkle = prefersReduced
          ? 1
          : 0.8 + 0.2 * Math.sin(t * 0.0011 * st.tw + st.p);

        const alpha = Math.min(0.7, depth * 0.55 * twinkle);
        const radius = st.r * (0.75 + st.z * 1.0);

        const px = st.x + m.tx * (st.z - 0.2) * 14;
        const py =
          st.y +
          m.ty * (st.z - 0.2) * 12 -
          parallax * (0.35 + st.z * 1.35);

        drawGlowStar(px, py, radius, alpha);

        if (st.z > 0.84 && twinkle > 0.94) {
          ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px - 6, py);
          ctx.lineTo(px + 6, py);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(px, py - 6);
          ctx.lineTo(px, py + 6);
          ctx.stroke();
        }
      }

      if (!prefersReduced) spawnMeteor();

      ctx.globalCompositeOperation = "lighter";

      for (let i = meteors.length - 1; i >= 0; i--) {
        const mt = meteors[i];
        mt.life += 1;
        mt.x += mt.vx;
        mt.y += mt.vy;

        const k = 1 - mt.life / mt.maxLife;
        const appear = Math.min(1, mt.life / mt.fadeIn);
        const baseA = 0.1 + mt.z * 0.3;
        const a = Math.max(0, Math.min(0.42, k * baseA)) * appear;
        const lw = (1.0 + mt.z * 2.2) * (0.85 + 0.15 * appear);
        const trailGrow = 0.15 + 0.85 * appear;
        const tx = mt.x - mt.vx * (mt.w / 12) * trailGrow;
        const ty = mt.y - mt.vy * (mt.w / 12) * trailGrow;
        const grad = ctx.createLinearGradient(mt.x, mt.y, tx, ty);
        grad.addColorStop(0, `hsla(${mt.hue}, 95%, 92%, ${a})`);
        grad.addColorStop(0.25, `hsla(${mt.hue}, 90%, 85%, ${a * 0.55})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(mt.x, mt.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        drawGlowStar(mt.x, mt.y, mt.r, a * (1.2 + mt.z));

        if (!prefersReduced && mt.z > 0.78 && k > 0.25 && Math.random() < 0.22 * appear) {
          drawGlowStar(
            mt.x + (Math.random() - 0.5) * 6,
            mt.y + (Math.random() - 0.5) * 6,
            mt.r * 0.55,
            a * 0.65
          );
        }

        if (
          mt.life > mt.maxLife ||
          mt.x < -500 ||
          mt.y > h + 500 ||
          mt.x > w + 500 ||
          mt.y < -500
        ) {
          meteors.splice(i, 1);
        }
      }

      ctx.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <style>{`
        /* ---- Global premium micro-styles ---- */
        .premium-divider {
          height: 1px;
          width: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.10), transparent);
          opacity: .9;
        }

        .premium-title {
          position: relative;
          background: linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,.62), rgba(255,255,255,1));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          background-size: 200% 100%;
          animation: titleSheen 3.8s ease-in-out infinite;
        }
        @keyframes titleSheen {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .shimmer-btn {
          position: relative;
          overflow: hidden;
          transform: translateZ(0);
        }
        .shimmer-btn::after {
          content: "";
          position: absolute;
          inset: -40%;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.20) 45%, transparent 60%);
          transform: translateX(-120%);
          transition: transform 650ms ease;
        }
        .shimmer-btn:hover::after { transform: translateX(120%); }

        .glass-btn {
          box-shadow: 0 18px 50px rgba(0,0,0,.35);
          transition: transform 220ms ease, box-shadow 220ms ease;
        }
        .glass-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 65px rgba(0,0,0,.45);
        }

        /* Contact pulse highlight */
        .contact-pulse {
          position: relative;
        }
        .contact-pulse::before {
          content: "";
          position: absolute;
          inset: -10px;
          border-radius: 32px;
          background: radial-gradient(60% 70% at 50% 40%, rgba(255,255,255,.08), transparent 60%),
                      radial-gradient(55% 55% at 35% 45%, rgba(99,102,241,.10), transparent 60%),
                      radial-gradient(55% 55% at 65% 45%, rgba(168,85,247,.08), transparent 60%);
          filter: blur(10px);
          opacity: 0;
          pointer-events: none;
          animation: contactPulse 1.25s ease-out forwards;
        }
        @keyframes contactPulse {
          0%   { opacity: 0; transform: scale(.96); }
          35%  { opacity: 1; transform: scale(1.00); }
          100% { opacity: 0; transform: scale(1.02); }
        }

        .page-aurora {
          filter: blur(70px);
          opacity: .36;
          background:
            radial-gradient(40% 40% at 20% 30%, rgba(99,102,241,.14), transparent 60%),
            radial-gradient(45% 45% at 80% 35%, rgba(168,85,247,.10), transparent 60%),
            radial-gradient(50% 50% at 45% 75%, rgba(34,197,94,.05), transparent 62%);
          animation: auroraShift 14s ease-in-out infinite alternate;
          transform: translateZ(0);
        }
        @keyframes auroraShift {
          0%   { transform: translate3d(-2%, -1%, 0) scale(1); }
          100% { transform: translate3d(2%,  1%, 0) scale(1.05); }
        }

        .page-grid {
          background-image:
            linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,.05) 1px, transparent 1px);
          background-size: 30px 30px;
          mask-image: radial-gradient(60% 55% at 50% 18%, black, transparent 72%);
          opacity: .20;
          animation: gridBreath 8s ease-in-out infinite;
        }
        @keyframes gridBreath {
          0%,100% { opacity: .16; transform: translateY(0); }
          50%     { opacity: .24; transform: translateY(6px); }
        }

        .page-noise {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.22'/%3E%3C/svg%3E");
          mix-blend-mode: overlay;
          opacity: .10;
          animation: noiseFloat 5s ease-in-out infinite alternate;
        }
        @keyframes noiseFloat {
          from { transform: translate3d(0,0,0); }
          to   { transform: translate3d(12px, -10px, 0); }
        }

        .page-vignette {
          background:
            radial-gradient(70% 55% at 50% 25%, rgba(255,255,255,.02), transparent 62%),
            radial-gradient(85% 80% at 50% 50%, transparent, rgba(0,0,0,.68));
        }

        @media (prefers-reduced-motion: reduce) {
          .page-aurora, .page-grid, .page-noise, .premium-title { animation: none; }
        }
      `}</style>

      <div className="absolute inset-0 page-aurora" />
      <div className="absolute inset-0 page-grid" />
      <div className="absolute inset-0 page-noise" />
      <div className="absolute inset-0 page-vignette" />
      <canvas ref={canvasRef} className="absolute inset-0 opacity-70" />
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
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function HomePage() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const contactSectionRef = useRef<HTMLElement | null>(null);
  const pulseTimer = useRef<number | null>(null);
  const [pulseContact, setPulseContact] = useState(false);
  const scrollToContact = () => {
    const el = contactSectionRef.current;
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "start" });

    setPulseContact(false);
    window.requestAnimationFrame(() => setPulseContact(true));

    if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
    pulseTimer.current = window.setTimeout(() => setPulseContact(false), 1300);

    window.setTimeout(() => {
      const firstField = el.querySelector("input, textarea, button") as HTMLElement | null;
      firstField?.focus?.();
    }, 550);
  };

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Xato:", err);
        setIsLoading(false);
      });

    return () => {
      if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
    };
  }, []);

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );

  return (
    <main className="relative min-h-screen bg-[#020202] selection:bg-primary/30 overflow-x-hidden">
      <PageBackground />

      {}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 bg-background/50 backdrop-blur-sm mb-6"
          >
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm text-muted-foreground">Xush Kelibsiz & Welcome</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 premium-title"
          >
            {settings?.title || "I build smart, scalable digital products"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
          >
            {settings?.description || "Full-stack software engineer specializing in modern web technologies."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/projects"
              className="group px-8 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 shimmer-btn glass-btn"
            >
              View Projects
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            {settings?.cvUrl ? (
              <a
                href={`${API_URL}${settings.cvUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm hover:bg-accent transition-colors flex items-center gap-2 shimmer-btn glass-btn"
              >
                <FileText size={18} />
                Download CV
              </a>
            ) : (
              <button
                type="button"
                onClick={scrollToContact}
                className="px-8 py-4 rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm hover:bg-accent transition-colors shimmer-btn glass-btn"
              >
                Get in Touch
              </button>
            )}
          </motion.div>

          <div className="mt-16 premium-divider" />
        </div>
      </section>

      {}
      <section className="py-24">
        <Reveal>
          <ProfileCard data={settings} />
        </Reveal>
      </section>

      <section className="py-24 bg-white/[0.01]">
        <Reveal delay={0.05}>
          <Skills />
        </Reveal>
      </section>

      <section className="py-24">
        <Reveal delay={0.05}>
          <Experience />
        </Reveal>
      </section>

      {}
      <section
        id="contact"
        ref={(el) => (contactSectionRef.current = el)}
        className={`py-24 bg-white/[0.01] ${pulseContact ? "contact-pulse" : ""}`}
      >
        <Reveal delay={0.05}>
          <Contact data={settings} />
        </Reveal>
      </section>
    </main>
  );
}
