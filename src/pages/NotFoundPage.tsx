import { motion } from "framer-motion";
import { ArrowLeft, Home, Sparkles } from "lucide-react";
import { Link } from "../lib/router";
import { useEffect, useState } from "react";

export function NotFoundPage() {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-center overflow-hidden px-4 select-none bg-black">
      {/* Background Cyber Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Cyber Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Futuristic Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-indigo-400 rounded-full opacity-30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main 404 Oyna */}
      <div className="z-10 text-center max-w-lg w-full px-6 py-12 rounded-[2.5rem] border border-white/10 bg-slate-950/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Animated Glitched 404 Text */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative text-8xl sm:text-9xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-cyan-400 select-none ${
            glitch ? "animate-pulse scale-[1.02]" : ""
          }`}
        >
          {glitch ? "4_0_4" : "404"}
          {glitch && (
            <span className="absolute inset-0 text-cyan-400 opacity-70 blur-[2px] translate-x-[2px] translate-y-[-2px]">
              404
            </span>
          )}
        </motion.h1>

        {/* Sahifa mavjud emasligi sarlavhasi */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center justify-center gap-2"
        >
          <Sparkles className="text-cyan-400 animate-spin [animation-duration:8s]" size={20} />
          Koinot Qa'rida Yo'qolgan Sahifa
          <Sparkles className="text-cyan-400 animate-spin [animation-duration:8s]" size={20} />
        </motion.h2>

        {/* Tavsif matni */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed font-sans"
        >
          Siz qidirayotgan sahifa olis galaktikalarda g'oyib bo'lgan ko'rinadi yoki manzili o'zgartirilgan. Bosh sahifaga qaytib, saytni o'rganishni davom ettiring!
        </motion.p>

        {/* Tugmalar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3.5 w-full sm:w-auto justify-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
          >
            <Home size={18} />
            Bosh Sahifa
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3.5 w-full sm:w-auto justify-center bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-white/20 rounded-2xl font-semibold transition-all active:scale-[0.98]"
          >
            <ArrowLeft size={18} />
            Orqaga Qaytish
          </button>
        </motion.div>
      </div>
    </div>
  );
}
