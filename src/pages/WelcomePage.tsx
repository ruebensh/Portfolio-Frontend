import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface WelcomePageProps {
  onEnter: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onEnter }) => {
  const [isEntering, setIsEntering] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const cardRef = useRef<HTMLDivElement>(null);

  // Kursor koordinatalari va 3D tilt burchagini hisoblash
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleCardClick = () => {
    if (isEntering) return;
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
    }, 1100);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans select-none flex flex-col justify-between items-center perspective-[1200px]">
      {/* 1. Realistik Orqa Fon */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2560')] bg-cover bg-center filter brightness-90 contrast-105 scale-105 transition-transform duration-1000" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center">
            <Sparkles size={18} className="text-amber-300" />
          </div>
          <span className="text-white drop-shadow-md">Jaloliddin Xalimov</span>
        </div>

        <button
          onClick={handleCardClick}
          className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
        >
          Explore Site
        </button>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
        {/* 3D Glass Karta */}
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleCardClick}
          animate={
            isEntering
              ? {
                  rotate: [0, 180, 720],
                  scale: [1, 2.5, 35],
                  opacity: [1, 1, 0],
                  transition: { duration: 1.1, ease: [0.4, 0, 0.2, 1] }
                }
              : {
                  rotateX: tilt.x,
                  rotateY: tilt.y,
                  scale: 1,
                  opacity: 1,
                }
          }
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-[310px] h-[430px] md:w-[370px] md:h-[500px] rounded-[2.5rem] cursor-pointer overflow-hidden bg-slate-950/40 backdrop-blur-2xl border border-white/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col justify-between p-8 text-left group mb-6 transition-border duration-300 hover:border-white/50"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-60 pointer-events-none" />

          {/* Kursor harakatlanganda public/avatar.jpg dagi rasm ochilishi */}
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-300"
            style={{
              backgroundImage: `url('/avatar.jpg')`,
              opacity: isHovered ? 1 : 0,
              WebkitMaskImage: `radial-gradient(circle 140px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
              maskImage: `radial-gradient(circle 140px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
            }}
          />

          <div className="relative z-10 flex justify-between items-start pointer-events-none">
            <span className="px-3.5 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-semibold tracking-wider text-white uppercase backdrop-blur-md shadow-sm">
              Portfolio OS
            </span>
            <ShieldCheck size={22} className="text-white/70 group-hover:text-white transition-colors" />
          </div>

          <div className="relative z-10 pointer-events-none">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-300/80 mb-1">
              Interactive Experience
            </p>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              Jaloliddin Xalimov
            </h3>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              AI Engineer & Full-Stack Developer
            </p>
          </div>
        </motion.div>

        {/* Text & Button */}
        <motion.div
          animate={isEntering ? { opacity: 0, y: -30 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-3 max-w-xl"
        >
          <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight leading-snug drop-shadow-lg">
            Enter New Places Without Starting Over
          </h1>

          <button
            onClick={handleCardClick}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-slate-100 transition-all shadow-2xl hover:scale-105 active:scale-95 mt-2 cursor-pointer"
          >
            <span>Touch Card to Begin</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </main>

      <footer className="relative z-10 py-6 text-center text-xs text-white/50 tracking-wide">
        © 2026 Jaloliddin Xalimov. All Rights Reserved.
      </footer>
    </div>
  );
};

export default WelcomePage;