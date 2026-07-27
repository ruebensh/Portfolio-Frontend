import { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface WelcomePageProps {
  onEnter: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function WelcomePage({ onEnter }: WelcomePageProps) {
  const [settings, setSettings] = useState<any>(null);
  const [isEntering, setIsEntering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  // Real-time Canvas Earth & Stars Background (100% Reliable, no black screen)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    let animationId: number;
    let angle = 0;

    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 1.8 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005,
    }));

    const draw = () => {
      // Space background gradient
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, Math.max(w, h));
      bgGrad.addColorStop(0, "#0b1329");
      bgGrad.addColorStop(0.5, "#040714");
      bgGrad.addColorStop(1, "#010206");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Stars
      ctx.fillStyle = "#ffffff";
      stars.forEach((star) => {
        star.alpha += star.speed;
        ctx.globalAlpha = Math.abs(Math.sin(star.alpha));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Rotating Earth / Planet Atmosphere Glow in background
      angle += 0.003;
      const planetX = w / 2;
      const planetY = h / 2;
      const planetRadius = Math.min(w, h) * 0.38;

      // Outer atmosphere glow
      const glowGrad = ctx.createRadialGradient(
        planetX,
        planetY,
        planetRadius * 0.8,
        planetX,
        planetY,
        planetRadius * 1.45
      );
      glowGrad.addColorStop(0, "rgba(59, 130, 246, 0.4)");
      glowGrad.addColorStop(0.5, "rgba(99, 102, 241, 0.2)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(planetX, planetY, planetRadius * 1.45, 0, Math.PI * 2);
      ctx.fill();

      // Earth body gradient
      const earthGrad = ctx.createRadialGradient(
        planetX - planetRadius * 0.3,
        planetY - planetRadius * 0.3,
        planetRadius * 0.1,
        planetX,
        planetY,
        planetRadius
      );
      earthGrad.addColorStop(0, "#1d4ed8");
      earthGrad.addColorStop(0.4, "#0f172a");
      earthGrad.addColorStop(0.85, "#020617");
      earthGrad.addColorStop(1, "#000000");

      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
      ctx.fill();

      // Rotating planet grid / texture lines
      ctx.strokeStyle = "rgba(147, 197, 253, 0.15)";
      ctx.lineWidth = 1.5;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.ellipse(
          planetX,
          planetY + i * (planetRadius / 4),
          planetRadius * Math.cos((i * Math.PI) / 8),
          planetRadius * 0.25,
          angle + i * 0.2,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const name = settings?.author || "Jaloliddin Xalimov";

  const handleEnter = () => {
    if (isEntering) return;
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010206] overflow-hidden select-none">
      {/* Earth & Cosmos Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Ambient background glow */}
      <div className="absolute w-[650px] h-[650px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none animate-pulse" />

      {/* Main Glass Card with Large Name */}
      <div
        onClick={handleEnter}
        className={`relative z-10 cursor-pointer group px-8 py-12 sm:px-16 sm:py-20 rounded-[2.5rem] backdrop-blur-2xl bg-white/[0.05] border border-white/20 shadow-[0_30px_100px_rgba(0,0,0,0.8)] transition-all duration-700 ease-out flex flex-col items-center justify-center text-center max-w-[90vw] sm:max-w-2xl ${
          isEntering
            ? "scale-[25] opacity-0 rotate-[360deg] pointer-events-none"
            : "hover:scale-105 hover:bg-white/[0.08] hover:border-white/40 hover:shadow-indigo-500/20"
        }`}
        style={{
          boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 25px 90px rgba(0, 0, 0, 0.7)",
        }}
      >
        {/* Shimmer top border */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md mb-6 sm:mb-8 shadow-inner">
          <Sparkles size={14} className="text-indigo-400 animate-spin" />
          <span className="text-xs text-white/90 tracking-widest uppercase font-medium">Welcome to Portfolio</span>
        </div>

        {/* Large Glass Text Name */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-white/60 drop-shadow-[0_10px_35px_rgba(255,255,255,0.35)]">
          {name}
        </h1>

        {/* Click CTA Button */}
        <div className="mt-8 sm:mt-12 inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-white text-black font-semibold text-sm shadow-xl group-hover:bg-white/90 group-hover:scale-105 transition-all">
          <span>Portfolioga kirish</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Transition Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-[#020202] pointer-events-none transition-opacity duration-700 ${
          isEntering ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}