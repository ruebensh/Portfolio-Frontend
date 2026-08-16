import { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles, FileText, Send, Loader2, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "../lib/router";
import MovingGradientButton from "../components/originkit/ui/moving-gradient-button";
import { useLanguage } from "../context/LanguageContext";
import { usePerformance, QualityTier } from "../context/PerformanceContext";
import { translateDynamicText } from "../lib/translator";

import { ProfileCard } from "../components/home/ProfileCard";
import { Skills } from "../components/home/Skills";
import { Experience } from "../components/home/Experience";
import { Contact } from "../components/home/Contact";

// AI Xizmatini import qilamiz
import { sendMessageToAI } from "../services/aiService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function PageBackground() {
  const { tier } = usePerformance();
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

    // 6-Tier Star Count Scaling
    let targetStarCount = 250; // high default
    if (tier === "best")   targetStarCount = 1800;
    else if (tier === "max")    targetStarCount = 1200;
    else if (tier === "ultra")  targetStarCount = 600;
    else if (tier === "high")   targetStarCount = 250;
    else if (tier === "medium") targetStarCount = 120;
    else if (tier === "low")    targetStarCount = 60;

    const densityDivisor = tier === "best" ? 900 : tier === "max" ? 1400 : tier === "ultra" ? 2200 : 4500;
    const starCount = Math.floor(Math.min(targetStarCount, Math.max(40, (w * h) / densityDivisor)));
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
      if (prefersReduced || tier === "low" || tier === "medium") return;
      // Best & Max tier spawn meteors frequently
      const spawnChance = tier === "best" ? 0.085 : tier === "max" ? 0.055 : 0.028;
      if (Math.random() > spawnChance) return;

      const z = Math.random() < 0.15 ? 0.75 + Math.random() * 0.25 : Math.pow(Math.random(), 2.2);
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

      meteors.push({ x: startX, y: startY, vx, vy, life: 0, maxLife, w: trail, z, r, hue, fadeIn });
      if (meteors.length > 8) meteors.shift();
    };

    const drawGlowStar = (x: number, y: number, radius: number, alpha: number) => {
      if (tier === "low" || tier === "medium") {
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.5, radius * 0.9), 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      // Best & Max tier: extra wide double glow ring for maximum sparkle
      const glowRadius = tier === "best" ? radius * 12 : tier === "max" ? radius * 9 : radius * 6;
      const g = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      g.addColorStop(0, `rgba(255,255,255,${alpha})`);
      g.addColorStop(0.15, tier === "best" ? `rgba(255,215,0,${alpha * 0.7})` : `rgba(220,180,255,${tier === "max" ? alpha * 0.6 : alpha * 0.3})`);
      g.addColorStop(0.4, `rgba(255,255,255,${alpha * 0.18})`);
      g.addColorStop(1, `rgba(255,255,255,0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha * 1.1)})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.55, radius * (tier === "max" ? 1.2 : 1)), 0, Math.PI * 2);
      ctx.fill();
    };

    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      mouseRef.current.x = nx;
      mouseRef.current.y = ny;
    };

    const onScroll = () => { scrollRef.current.y = window.scrollY || 0; };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    let lastT = performance.now();
    const tick = (t: number) => {
      // 240 FPS High Refresh Rate Delta Scaling (~16.667ms baseline)
      const dtFactor = Math.min(2.5, Math.max(0.1, (t - lastT) / 16.667));
      lastT = t;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
      const m = mouseRef.current;
      m.tx += (m.x - m.tx) * 0.06 * dtFactor;
      m.ty += (m.y - m.ty) * 0.06 * dtFactor;
      const s = scrollRef.current;
      s.ty += (s.y - s.ty) * 0.14 * dtFactor;
      const parallaxBase = 0.2;
      const parallax = s.ty * parallaxBase;
      const bg = ctx.createRadialGradient(w * 0.5 + m.tx * 60, h * 0.35 + m.ty * 40, Math.min(w, h) * 0.12, w * 0.5, h * 0.5, Math.max(w, h) * 0.95);
      bg.addColorStop(0, "rgba(255,255,255,0.010)");
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      for (const st of stars) {
        if (!prefersReduced) {
          const starFall = 1.85;
          st.y += (0.02 + st.z * 0.12) * 0.6 * starFall * dtFactor;
          if (st.y > h + 40) st.y = -40;
        }
        const depth = 0.22 + st.z * 0.85;
        const twinkle = prefersReduced ? 1 : 0.8 + 0.2 * Math.sin(t * 0.0011 * st.tw + st.p);
        const alpha = Math.min(0.7, depth * 0.55 * twinkle);
        const radius = st.r * (0.75 + st.z * 1.0);
        const px = st.x + m.tx * (st.z - 0.2) * 14;
        const py = st.y + m.ty * (st.z - 0.2) * 12 - parallax * (0.35 + st.z * 1.35);
        drawGlowStar(px, py, radius, alpha);
        if (st.z > 0.84 && twinkle > 0.94) {
          ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(px - 6, py); ctx.lineTo(px + 6, py); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(px, py - 6); ctx.lineTo(px, py + 6); ctx.stroke();
        }
      }
      if (!prefersReduced) spawnMeteor();
      ctx.globalCompositeOperation = "lighter";
      for (let i = meteors.length - 1; i >= 0; i--) {
        const mt = meteors[i];
        mt.life += 1; mt.x += mt.vx; mt.y += mt.vy;
        const k = 1 - mt.life / mt.maxLife;
        const appear = Math.min(1, mt.life / mt.fadeIn);
        const baseA = 0.1 + mt.z * 0.3;
        const a = Math.max(0, Math.min(0.42, k * baseA)) * appear;
        const lw = (1.0 + mt.z * 2.2) * (0.85 + 0.15 * appear);
        const tx = mt.x - mt.vx * (mt.w / 12) * (0.15 + 0.85 * appear);
        const ty = mt.y - mt.vy * (mt.w / 12) * (0.15 + 0.85 * appear);
        const grad = ctx.createLinearGradient(mt.x, mt.y, tx, ty);
        grad.addColorStop(0, `hsla(${mt.hue}, 95%, 92%, ${a})`);
        grad.addColorStop(0.25, `hsla(${mt.hue}, 90%, 85%, ${a * 0.55})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(mt.x, mt.y); ctx.lineTo(tx, ty); ctx.stroke();
        drawGlowStar(mt.x, mt.y, mt.r, a * (1.2 + mt.z));
        if (mt.life > mt.maxLife || mt.x < -500 || mt.y > h + 500 || mt.x > w + 500 || mt.y < -500) { meteors.splice(i, 1); }
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
        .premium-divider { height: 1px; width: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.10), transparent); opacity: .9; }
        .premium-title { position: relative; background: linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,.62), rgba(255,255,255,1)); -webkit-background-clip: text; background-clip: text; color: transparent; background-size: 200% 100%; animation: titleSheen 3.8s ease-in-out infinite; }
        @keyframes titleSheen { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .shimmer-btn { position: relative; overflow: hidden; transform: translateZ(0); }
        .shimmer-btn::after { content: ""; position: absolute; inset: -40%; background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.20) 45%, transparent 60%); transform: translateX(-120%); transition: transform 650ms ease; }
        .shimmer-btn:hover::after { transform: translateX(120%); }
        .glass-btn { box-shadow: 0 18px 50px rgba(0,0,0,.35); transition: transform 220ms ease, box-shadow 220ms ease; }
        .glass-btn:hover { transform: translateY(-2px); box-shadow: 0 22px 65px rgba(0,0,0,.45); }
        .page-aurora { filter: blur(70px); opacity: .22; background: radial-gradient(40% 40% at 20% 30%, rgba(99,102,241,.14), transparent 60%), radial-gradient(45% 45% at 80% 35%, rgba(168,85,247,.10), transparent 60%), radial-gradient(50% 50% at 45% 75%, rgba(34,197,94,.05), transparent 62%); animation: auroraShift 14s ease-in-out infinite alternate; transform: translateZ(0); }
        @keyframes auroraShift { 0% { transform: translate3d(-2%, -1%, 0) scale(1); } 100% { transform: translate3d(2%, 1%, 0) scale(1.05); } }
        .page-grid { background-image: linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.05) 1px, transparent 1px); background-size: 30px 30px; mask-image: radial-gradient(60% 55% at 50% 18%, black, transparent 72%); opacity: .12; animation: gridBreath 8s ease-in-out infinite; }
        @keyframes gridBreath { 0%,100% { opacity: .10; transform: translateY(0); } 50% { opacity: .16; transform: translateY(6px); } }
        .page-vignette { background: radial-gradient(70% 55% at 50% 25%, rgba(255,255,255,.02), transparent 62%), radial-gradient(85% 80% at 50% 50%, transparent, rgba(0,0,0,.75)); }
      `}</style>

      {/* Existing atmospheric layers on top */}
      <div className="absolute inset-0 page-aurora" />
      <div className="absolute inset-0 page-grid" />
      <div className="absolute inset-0 page-vignette" />
      <canvas ref={canvasRef} className="absolute inset-0 opacity-55" />
    </div>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number; }) {
  return (
    <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function HomeEntranceReveal() {
  const [active, setActive] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // 50ms delay ensures browser paints initial 100% black backdrop before 2.5s inverse fade-in transition
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 50);

    const removeTimer = setTimeout(() => {
      setActive(false);
    }, 2600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!active) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] pointer-events-none overflow-hidden bg-black transition-all duration-[2500ms] ease-in-out ${
        fading ? "opacity-0 backdrop-blur-none" : "opacity-100 backdrop-blur-3xl"
      }`}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-[400px] h-[400px] sm:w-[700px] sm:h-[700px] rounded-full bg-indigo-500/20 blur-3xl transition-all duration-[2500ms] ease-in-out ${
            fading ? "scale-150 opacity-0" : "scale-100 opacity-100"
          }`}
        />
      </div>
    </div>
  );
}

export function HomePage() {
  const { language, t } = useLanguage();
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [sessionId] = useState(() => "session_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now());

  const contactSectionRef = useRef<HTMLElement | null>(null);
  const pulseTimer = useRef<number | null>(null);
  const [pulseContact, setPulseContact] = useState(false);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || isAiLoading) return;
    setIsAiLoading(true);
    const response = await sendMessageToAI(aiInput, sessionId);
    setAiResponse(response);
    setIsAiLoading(false);
  };

  const scrollToContact = () => {
    const el = contactSectionRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setPulseContact(false);
    window.requestAnimationFrame(() => setPulseContact(true));
    if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
    pulseTimer.current = window.setTimeout(() => setPulseContact(false), 1300);
  };

  useEffect(() => {
    fetch(`${API_URL}/settings`).then(res => res.json()).then(data => {
      setSettings(data); setIsLoading(false);
    }).catch(err => { console.error("Xato:", err); setIsLoading(false); });
    return () => { if (pulseTimer.current) window.clearTimeout(pulseTimer.current); };
  }, []);

  if (isLoading) return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const heroTitle = settings?.title 
    ? translateDynamicText(settings.title, language) 
    : t("home.defaultTitle");

  const heroDesc = settings?.description 
    ? translateDynamicText(settings.description, language) 
    : t("home.defaultDesc");

  return (
    <main className="relative min-h-screen bg-[#020202] selection:bg-primary/30 overflow-x-hidden">
      <PageBackground />

      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32 text-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 bg-background/50 backdrop-blur-sm mb-6">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm text-muted-foreground">{t("home.badge")}</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }} className="text-3xl sm:text-6xl lg:text-7xl font-bold mb-6 premium-title">
            {heroTitle}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.16, ease: [0.22, 1, 0.36, 1] }} className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            {heroDesc}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.24, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/projects" className="group px-8 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 shimmer-btn glass-btn">
              {t("home.viewProjects")} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            {settings?.cvUrl ? (
              <a href={`${API_URL}${settings.cvUrl}`} target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm hover:bg-accent transition-colors flex items-center gap-2 shimmer-btn glass-btn">
                <FileText size={18} /> {t("home.downloadCv")}
              </a>
            ) : (
              <button type="button" onClick={scrollToContact} className="px-8 py-4 rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm hover:bg-accent transition-colors shimmer-btn glass-btn">{t("home.getInTouch")}</button>
            )}
          </motion.div>
          <div className="mt-16 premium-divider" />
        </div>
      </section>

      <section className="py-24">
        <Reveal><ProfileCard data={settings} /></Reveal>
      </section>

      <section className="py-8 sm:py-12 px-5 sm:px-6">
        <Reveal delay={0.1}>
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl border border-primary/20 bg-primary/5 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex-1 text-left">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg text-primary"><Bot size={22} /></div>
                    <h2 className="text-xl sm:text-2xl font-bold premium-title text-white">{t("ai.title")}</h2>
                  </div>
                  <MovingGradientButton
                    label={t("ai.fullChat")}
                    link="/ai-chat"
                    newTab={false}
                    colors={{ fill: "#150e38", hoverFill: "#261a5e", textColor: "#FFFFFF", hoverTextColor: "#38BDF8" }}
                    stroke={{ headColor: "#38BDF8", color: "#A855F7", count: 2, speed: 25, trail: 70, movement: "continuous" }}
                    addIcon={true}
                    icon={{ symbol: "✨", size: 13, color: "#FACC15" }}
                    rounded={100}
                    padding="8px 16px"
                    gap={6}
                    border={{ borderWidth: 1, borderColor: "rgba(168,85,247,0.4)" }}
                    font={{ fontSize: 12, fontWeight: 600 }}
                  />
                </div>
                <p className="text-muted-foreground mb-5 text-sm">{t("ai.desc")}</p>
                <form onSubmit={handleAskAI} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder={t("ai.placeholder")}
                    className="flex-1 bg-background/50 border border-border/40 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-primary outline-none text-white transition-all text-sm"
                  />
                  <button type="submit" disabled={isAiLoading || !aiInput.trim()} className="disabled:opacity-50 flex-shrink-0">
                    <MovingGradientButton
                      label={isAiLoading ? t("common.loading") : t("ai.submit")}
                      colors={{ fill: "#4f46e5", hoverFill: "#4338ca", textColor: "#FFFFFF", hoverTextColor: "#FACC15" }}
                      stroke={{ headColor: "#FACC15", color: "#38BDF8", count: 2, speed: 28, trail: 75, movement: "continuous" }}
                      addIcon={true}
                      icon={{ symbol: isAiLoading ? "⏳" : "➔", size: 15, color: "#FFFFFF" }}
                      rounded={16}
                      padding="12px 22px"
                      gap={8}
                      border={{ borderWidth: 2, borderColor: "rgba(250,204,21,0.3)" }}
                      font={{ fontSize: 13, fontWeight: 700 }}
                    />
                  </button>
                </form>
              </div>
              {aiResponse && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-background/40 border border-border/20 p-5 rounded-2xl backdrop-blur-md">
                  <p className="text-sm leading-relaxed italic text-gray-300 text-left">"{aiResponse}"</p>
                </motion.div>
              )}
            </div>
          </div>
        </Reveal>
      </section>
      {/* ---------------------------------- */}

      <section className="py-24 bg-white/[0.01]">
        <Reveal delay={0.05}><Skills /></Reveal>
      </section>

      <section className="py-24">
        <Reveal delay={0.05}><Experience /></Reveal>
      </section>

      <section id="contact" ref={(el) => (contactSectionRef.current = el)} className={`py-24 bg-white/[0.01] ${pulseContact ? "contact-pulse" : ""}`}>
        <Reveal delay={0.05}><Contact data={settings} /></Reveal>
      </section>
    </main>
  );
}