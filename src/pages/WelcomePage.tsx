import { useState, useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";

interface WelcomePageProps {
  onEnter: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotSpeed: number;
}

export function WelcomePage({ onEnter }: WelcomePageProps) {
  const [isEntering, setIsEntering] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const handleEnter = () => {
    if (isEntering) return;
    setIsEntering(true);

    // Trigger particle shatter explosion effect
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const w = (canvas.width = window.innerWidth);
      const h = (canvas.height = window.innerHeight);

      const particleCount = 140;
      const particles: Particle[] = [];

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 14 + 4;
        const colors = [
          "rgba(255, 255, 255, ",
          "rgba(199, 210, 254, ",
          "rgba(147, 197, 253, ",
          "rgba(224, 231, 255, ",
        ];
        const colorBase = colors[Math.floor(Math.random() * colors.length)];

        const startX = w / 2 + (Math.random() - 0.5) * (w * 0.6);
        const startY = h / 2 + (Math.random() - 0.5) * (h * 0.4);

        particles.push({
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - Math.random() * 3,
          size: Math.random() * 7 + 2,
          color: colorBase,
          alpha: 1,
          life: 0,
          maxLife: 45 + Math.random() * 30,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.25,
        });
      }

      particlesRef.current = particles;

      const renderShatter = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, w, h);

        let activeCount = 0;
        particlesRef.current.forEach((p) => {
          p.life++;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.1;
          p.vx *= 0.98;
          p.rotation += p.rotSpeed;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);

          if (p.alpha > 0) {
            activeCount++;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = `${p.color}${p.alpha})`;

            ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
            ctx.shadowBlur = 14;

            ctx.beginPath();
            ctx.moveTo(0, -p.size * 1.5);
            ctx.lineTo(p.size, 0);
            ctx.lineTo(0, p.size * 1.5);
            ctx.lineTo(-p.size, 0);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
          }
        });

        if (activeCount > 0) {
          animFrameRef.current = requestAnimationFrame(renderShatter);
        }
      };

      animFrameRef.current = requestAnimationFrame(renderShatter);
    }

    setTimeout(() => {
      onEnter();
    }, 950);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 w-full h-screen overflow-hidden bg-[#0a0608] select-none text-white font-inter flex flex-col items-center justify-between py-12 md:py-16"
      style={{ height: "100vh", minHeight: "100vh" }}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${
          isEntering ? "scale-125 opacity-0 blur-xl" : "scale-100 opacity-100"
        }`}
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
          type="video/mp4"
        />
      </video>

      {/* Particle Shatter Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-30"
      />

      {/* Subtle Dark Ambient Overlay */}
      <div className="absolute inset-0 bg-black/25 z-10 pointer-events-none" />

      {/* Ambient Radial Glow behind Name */}
      <div className="absolute top-[20%] w-[700px] h-[350px] bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse z-10" />

      {/* Top/Center: Large Glass Text Name */}
      <div
        className={`relative z-20 pt-10 sm:pt-16 px-4 text-center transition-all duration-700 ${
          isEntering
            ? "opacity-0 scale-125 blur-xl rotate-1 pointer-events-none"
            : "opacity-100 scale-100"
        }`}
      >
        <h1 className="glass-3d-text text-4xl sm:text-6xl md:text-7xl lg:text-[95px] tracking-widest whitespace-nowrap">
          JALOLIDDIN XALIMOV
        </h1>
      </div>

      {/* Bottom: Glass Effect Enter Button */}
      <div
        className={`relative z-20 pb-6 sm:pb-10 transition-all duration-700 ${
          isEntering
            ? "opacity-0 scale-75 blur-xl pointer-events-none"
            : "opacity-100 scale-100"
        }`}
      >
        <button
          onClick={handleEnter}
          className="glass-3d-button text-white px-10 py-4.5 rounded-full font-bold text-base sm:text-lg tracking-widest uppercase flex items-center gap-3.5 cursor-pointer group"
        >
          <span>ENTER PORTFOLIO</span>
          <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
        </button>
      </div>

      {/* Transition Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-[#0a0608] pointer-events-none transition-opacity duration-1000 ${
          isEntering ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}