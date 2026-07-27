import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface WelcomePageProps {
  onEnter: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const WelcomePage: React.FC<WelcomePageProps> = ({ onEnter }) => {
  const [isEntering, setIsEntering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [settings, setSettings] = useState<any>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch settings
  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  // 3D Tilt Formula
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isEntering) return;
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      setTilt({ x: rotateX, y: rotateY });
      setMousePos({ x, y });
    },
    [isEntering]
  );

  const handleMouseEnter = useCallback(() => {
    if (!isEntering) setIsHovered(true);
  }, [isEntering]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  // Click → Spin & Expand
  const handleClick = useCallback(() => {
    if (isEntering) return;
    setIsEntering(true);
    setTimeout(() => onEnter(), 1100);
  }, [isEntering, onEnter]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans select-none flex flex-col justify-between items-center"
      style={{ perspective: "1200px" }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
        .font-serif-welcome { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; }
        .font-sans { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
      `}</style>

      {/* ─── Background Layer 1: High-res cinematic image ─── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2560')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.9) contrast(1.05)",
          transform: "scale(1.05)",
        }}
      />

      {/* ─── Background Layer 2: Dark Vignette & Gradient Overlays ─── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* ─── Header Navigation ─── */}
      <motion.header
        animate={isEntering ? { y: -40, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-20 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between"
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center">
            <Sparkles size={18} className="text-amber-300" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight drop-shadow-md">
            {settings?.author || "Jaloliddin Xalimov"}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleClick}
          className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
        >
          Explore Site
        </button>
      </motion.header>

      {/* ─── Main Hero Section ─── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
        {/* 3D Glassmorphism Card */}
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          animate={
            isEntering
              ? {
                  rotate: [0, 180, 720],
                  scale: [1, 2.5, 35],
                  opacity: [1, 1, 0],
                }
              : {
                  rotateX: tilt.x,
                  rotateY: tilt.y,
                  scale: 1,
                }
          }
          transition={
            isEntering
              ? { duration: 1.1, ease: [0.4, 0, 0.2, 1] }
              : { type: "spring", stiffness: 200, damping: 24 }
          }
          style={{ transformStyle: "preserve-3d" }}
          className="w-[310px] h-[430px] md:w-[370px] md:h-[500px] rounded-[2.5rem] cursor-pointer overflow-hidden bg-slate-950/40 backdrop-blur-2xl border border-white/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col justify-between p-8 text-left group mb-6 transition-[border-color] duration-300 hover:border-white/50 relative"
        >
          {/* Spotlight Mask — /avatar.jpg Revealer */}
          <div
            className="absolute inset-0 z-[5] pointer-events-none transition-opacity duration-300"
            style={{
              backgroundImage: "url('/avatar.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: isHovered ? 1 : 0,
              maskImage: `radial-gradient(circle 140px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
              WebkitMaskImage: `radial-gradient(circle 140px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
            }}
          />

          {/* Subtle top glow highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-[1]" />

          {/* Card Top Row */}
          <div className="flex items-center justify-between relative z-10">
            <span className="px-3.5 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-semibold tracking-wider text-white uppercase backdrop-blur-md shadow-sm">
              Portfolio OS
            </span>
            <ShieldCheck
              size={22}
              className="text-white/70 group-hover:text-white transition-colors"
            />
          </div>

          {/* Card Bottom Content */}
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-300/80 mb-1">
              Interactive Experience
            </p>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              {settings?.author || "Jaloliddin Xalimov"}
            </h3>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              {settings?.mainStack || "AI Engineer & Full-Stack Developer"}
            </p>
          </div>
        </motion.div>

        {/* Hero Text & Action Area */}
        <motion.div
          animate={isEntering ? { y: -30, opacity: 0 } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center gap-5"
        >
          <h1 className="text-3xl md:text-5xl font-serif-welcome text-white tracking-tight leading-snug drop-shadow-lg max-w-xl">
            Enter New Places Without Starting Over
          </h1>

          <button
            onClick={handleClick}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-slate-100 transition-all shadow-2xl hover:scale-105 active:scale-95 mt-2 cursor-pointer"
          >
            Touch Card to Begin
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </main>

      {/* ─── Screen cover during transition ─── */}
      <AnimatePresence>
        {isEntering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6, ease: "easeIn" }}
            className="fixed inset-0 z-50 bg-[#020202] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* ─── Footer ─── */}
      <motion.footer
        animate={isEntering ? { y: 30, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 py-6 text-center text-xs text-white/50 tracking-wide"
      >
        © 2026 {settings?.author || "Jaloliddin Xalimov"}. All Rights Reserved.
      </motion.footer>
    </div>
  );
};