import { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles, FileText } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "../lib/router";

import { ProfileCard } from "../components/home/ProfileCard";
import { Skills } from "../components/home/Skills";
import { Experience } from "../components/home/Experience";
import { Contact } from "../components/home/Contact";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/** ===== Background (CSS + JS animations) ===== */
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
      z: number; // 0..1 (near=1)
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
    };

    const starCount = Math.floor(Math.min(560, Math.max(260, (w * h) / 2400)));
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.pow(Math.random(), 1.9),
      r: 0.3 + Math.random() * 1.15,
      tw: 0.25 + Math.random() * 0.95,
      p: Math.random() * Math.PI * 2,
    }));

    const meteors: Meteor[] = [];

    const spawnMeteor = () => {
      if (prefersReduced) return;
      // Rare, subtle shooting star
      if (Math.random() > 0.012) return; // ~sometimes
      const startX = Math.random() * w * 0.8 + w * 0.1;
      const startY = Math.random() * h * 0.35 + h * 0.05;
      const speed = 9 + Math.random() * 5;
      const angle = (Math.PI * 7) / 6 + Math.random() * 0.25; // down-left
      meteors.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 40 + Math.random() * 25,
        w: 180 + Math.random() * 140,
      });
      if (meteors.length > 3) meteors.shift();
    };

    const drawGlowStar = (x: number, y: number, radius: number, alpha: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius * 6);
      g.addColorStop(0, `rgba(255,255,255,${alpha})`);
      g.addColorStop(0.25, `rgba(255,255,255,${alpha * 0.30})`);
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

      // Smooth mouse & scroll follow
      const m = mouseRef.current;
      m.tx += (m.x - m.tx) * 0.06;
      m.ty += (m.y - m.ty) * 0.06;

      const s = scrollRef.current;
      s.ty += (s.y - s.ty) * 0.08;

      // Soft “space depth” gradient that drifts with pointer
      const bg = ctx.createRadialGradient(
        w * 0.5 + m.tx * 50,
        h * 0.35 + m.ty * 32,
        Math.min(w, h) * 0.14,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.95
      );
      bg.addColorStop(0, "rgba(255,255,255,0.010)");
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Stars
      for (const st of stars) {
        if (!prefersReduced) {
          // tiny drift + gentle fall; near stars slightly more
          st.y += (0.02 + st.z * 0.12) * 0.6;
          if (st.y > h + 40) st.y = -40;
        }

        const depth = 0.22 + st.z * 0.85;
        const twinkle = prefersReduced ? 1 : 0.80 + 0.20 * Math.sin(t * 0.0011 * st.tw + st.p);
        const alpha = Math.min(0.70, depth * 0.55 * twinkle);
        const radius = st.r * (0.75 + st.z * 1.0);

        // parallax + tiny scroll shift (makes it feel “alive”)
        const px = st.x + m.tx * (st.z - 0.2) * 14;
        const py = st.y + m.ty * (st.z - 0.2) * 12 - (s.ty * 0.02 * st.z);

        drawGlowStar(px, py, radius, alpha);

        // occasional sparkle (very subtle)
        if (st.z > 0.82 && twinkle > 0.94) {
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

      // Shooting stars
      if (!prefersReduced) spawnMeteor();
      for (let i = meteors.length - 1; i >= 0; i--) {
        const mt = meteors[i];
        mt.life += 1;
        mt.x += mt.vx;
        mt.y += mt.vy;

        const k = 1 - mt.life / mt.maxLife;
        const a = Math.max(0, Math.min(0.28, k * 0.28));

        // tail
        const tx = mt.x - mt.vx * (mt.w / 10);
        const ty = mt.y - mt.vy * (mt.w / 10);
        const grad = ctx.createLinearGradient(mt.x, mt.y, tx, ty);
        grad.addColorStop(0, `rgba(255,255,255,${a})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mt.x, mt.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        // head glow
        drawGlowStar(mt.x, mt.y, 1.4, a * 1.8);

        if (mt.life > mt.maxLife || mt.x < -200 || mt.y > h + 200) {
          meteors.splice(i, 1);
        }
      }

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
      {/* CSS layers with animation */}
      <style>{`
        .page-aurora {
          filter: blur(70px);
          opacity: .40;
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
          opacity: .22;
          animation: gridBreath 8s ease-in-out infinite;
        }
        @keyframes gridBreath {
          0%,100% { opacity: .18; transform: translateY(0); }
          50%     { opacity: .26; transform: translateY(6px); }
        }

        .page-noise {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.22'/%3E%3C/svg%3E");
          mix-blend-mode: overlay;
          opacity: .12;
          animation: noiseFloat 5s ease-in-out infinite alternate;
        }
        @keyframes noiseFloat {
          from { transform: translate3d(0,0,0); }
          to   { transform: translate3d(12px, -10px, 0); }
        }

        .page-vignette {
          background:
            radial-gradient(70% 55% at 50% 25%, rgba(255,255,255,.02), transparent 62%),
            radial-gradient(85% 80% at 50% 50%, transparent, rgba(0,0,0,.65));
        }

        @media (prefers-reduced-motion: reduce) {
          .page-aurora, .page-grid, .page-noise { animation: none; }
        }
      `}</style>

      <div className="absolute inset-0 page-aurora" />
      <div className="absolute inset-0 page-grid" />
      <div className="absolute inset-0 page-noise" />
      <div className="absolute inset-0 page-vignette" />

      {/* JS stars */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-70" />
    </div>
  );
}

export function HomePage() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []);

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );

  return (
    <main className="relative min-h-screen bg-[#020202] selection:bg-primary/30 overflow-x-hidden">
      {/* Background with CSS + JS */}
      <PageBackground />

      {/* HERO inline (unchanged content) */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 bg-background/50 backdrop-blur-sm mb-6"
          >
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm text-muted-foreground">
              Available for new opportunities
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
          >
            {settings?.title || "I build smart, scalable digital products"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
          >
            {settings?.description ||
              "Full-stack software engineer specializing in modern web technologies."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/projects"
              className="group px-8 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              View Projects
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            {settings?.cvUrl ? (
              <a
                href={`${API_URL}${settings.cvUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm hover:bg-accent transition-colors flex items-center gap-2"
              >
                <FileText size={18} />
                Download CV
              </a>
            ) : (
              <Link
                href="/#contact"
                className="px-8 py-4 rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm hover:bg-accent transition-colors"
              >
                Get in Touch
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Other sections unchanged */}
      <section className="py-24">
        <ProfileCard data={settings} />
      </section>

      <section className="py-24 bg-white/[0.01]">
        <Skills />
      </section>

      <section className="py-24">
        <Experience />
      </section>

      <section id="contact" className="py-24 bg-white/[0.01]">
        <Contact data={settings} />
      </section>
    </main>
  );
}
