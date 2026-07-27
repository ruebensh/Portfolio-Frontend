import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Globe } from "lucide-react";

interface WelcomePageProps {
  onEnter: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function WelcomePage({ onEnter }: WelcomePageProps) {
  const [settings, setSettings] = useState<any>(null);
  const [isEntering, setIsEntering] = useState(false);

  // Fetch settings for database configurations
  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error("Xato settings yuklashda:", err));
  }, []);

  const avatarSrc = settings?.avatarUrl
    ? (settings.avatarUrl.startsWith("http") ? settings.avatarUrl : `${API_URL}${settings.avatarUrl}`)
    : "/avatar.jpg";

  // 3D Perspective Tilt Values
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for fluid motion physics
  const springConfig = { stiffness: 150, damping: 20 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el || isEntering) return;

    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleEnterClick = () => {
    if (isEntering) return;
    setIsEntering(true);

    // Call onEnter after the 900ms morph/zoom animation is complete
    setTimeout(() => {
      onEnter();
    }, 900);
  };

  return (
    <div className="min-h-screen w-full bg-black overflow-hidden relative select-none font-sans flex flex-col justify-between">
      {/* Import Instrument Serif or fallback Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        .font-serif {
          font-family: 'Instrument Serif', Georgia, serif;
        }
        .font-sans {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .liquid-glass {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Cinematic Full-screen Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2560"
          alt="Cinematic Background"
          className="w-full h-full object-cover pointer-events-none"
        />
        {/* Vignette & Lighting Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50" />
        <div className="absolute inset-0 bg-radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.4) 100%)" />
      </div>

      {/* Floating Navigation Bar */}
      <motion.nav
        animate={isEntering ? { y: -50, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="absolute top-0 inset-x-0 z-30 px-6 py-6 max-w-6xl mx-auto flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
            <Sparkles size={14} className="text-white animate-pulse" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-white">
            {settings?.author || "Jaloliddin Xalimov"}
          </span>
        </div>

        {/* Minimal Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Overview", "Projects", "About", "Blog"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-white/70 hover:text-white transition-colors text-sm font-medium"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Liquid-glass Explore Button */}
        <button
          onClick={handleEnterClick}
          className="liquid-glass rounded-full px-5 py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-white/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <Globe size={14} className="animate-spin-slow" />
          Explore Portfolio
        </button>
      </motion.nav>

      {/* Hero Wrapper & 3D Glass Card */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12 text-center w-full max-w-5xl mx-auto">
        
        {/* Animated Hero Title */}
        <motion.div
          animate={isEntering ? { y: -30, opacity: 0 } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-[10px] sm:text-xs text-white/60 tracking-wider uppercase mb-4">
            <Sparkles size={12} className="text-white" />
            Interactive Portfolio Experience
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-7xl text-white tracking-tight font-serif max-w-3xl leading-tight">
            Enter New Places Without Starting Over
          </h2>
        </motion.div>

        {/* 3D Glassmorphism Card Wrapper */}
        <div
          className="relative my-8 sm:my-10"
          style={{ perspective: 1000 }}
        >
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleEnterClick}
            animate={
              isEntering
                ? {
                    scale: 25,
                    rotateX: 0,
                    rotateY: 0,
                    borderRadius: "0rem",
                    transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] },
                  }
                : { scale: 1 }
            }
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
            className="w-[280px] h-[380px] sm:w-[320px] sm:h-[440px] md:w-[360px] md:h-[480px] rounded-[2.5rem] relative overflow-hidden cursor-pointer select-none transition-all duration-300"
          >
            {/* Top highlight glow */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            <AnimatePresence>
              {!isEntering && (
                <motion.div
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  className="absolute inset-0 p-8 flex flex-col justify-between"
                  style={{ transform: "translateZ(50px)" }} // Pop out in 3D space
                >
                  {/* Floating badge inside top */}
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                      <Sparkles size={16} className="text-white" />
                    </div>
                    <span className="text-[10px] tracking-widest text-white/50 uppercase bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                      OS / 2026
                    </span>
                  </div>

                  {/* Mid Profile Portrait (Inside Card) */}
                  <div className="flex-1 flex items-center justify-center my-4">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/20 shadow-xl relative group">
                      <img
                        src={avatarSrc}
                        alt="Author Avatar"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  </div>

                  {/* Typography & Details inside bottom */}
                  <div className="text-left space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      {settings?.author || "Jaloliddin X."}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/60">
                      {settings?.description || "Senior Full-Stack Software Engineer"}
                    </p>
                    <div className="w-full h-[1px] bg-white/10 my-3" />
                    <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-widest">
                      <span>Interactive Experience</span>
                      <span>v1.2.0</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dark overlay that fades in during full entry to transition into dark main page */}
            <div
              className={`absolute inset-0 bg-[#020202] transition-opacity duration-[900ms] pointer-events-none ${
                isEntering ? "opacity-100" : "opacity-0"
              }`}
            />
          </motion.div>
        </div>

        {/* Minimalist Subtitle & CTA Button */}
        <motion.div
          animate={isEntering ? { y: 20, opacity: 0 } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center gap-4"
        >
          <button
            onClick={handleEnterClick}
            className="group flex items-center gap-2 text-white/60 hover:text-white font-medium transition-all text-sm py-2 px-4 rounded-full border border-white/10 hover:border-white/20 bg-white/5"
          >
            <span>Touch Card to Begin</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Screen flash transition helper */}
      <AnimatePresence>
        {isEntering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 bg-[#020202] z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Bottom Footer metadata */}
      <motion.div
        animate={isEntering ? { y: 30, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-20 px-6 py-6 text-center text-[10px] text-white/30 tracking-widest uppercase pointer-events-none"
      >
        © 2026 Jaloliddin Xalimov. All Rights Reserved.
      </motion.div>
    </div>
  );
}