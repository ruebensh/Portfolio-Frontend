import { useState, useRef } from "react";
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
  decay: number;
}

export function WelcomePage({ onEnter }: WelcomePageProps) {
  const [isEntering, setIsEntering] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleEnter = () => {
    if (isEntering) return;
    setIsEntering(true);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const width = (canvas.width = window.innerWidth);
        const height = (canvas.height = window.innerHeight);

        const particleCount = 150000;
        const particles: Particle[] = [];

        const colors = [
          "#ffffff",
          "#f0f9ff",
          "#e0f2fe",
          "#bae6fd",
          "#818cf8",
          "#c084fc",
          "#ffffff",
        ];

        // Particles distributed uniformly across the entire screen
        for (let i = 0; i < particleCount; i++) {
          const px = Math.random() * width;
          const py = Math.random() * height;

          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 24 + 4;

          particles.push({
            x: px,
            y: py,
            vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 6,
            vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 6,
            size: Math.random() * 2.2 + 0.6,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: Math.random() * 0.8 + 0.2,
            decay: Math.random() * 0.014 + 0.007,
          });
        }

        let animId: number;

        const animate = () => {
          ctx.clearRect(0, 0, width, height);

          let activeCount = 0;

          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (p.alpha <= 0) continue;

            activeCount++;

            p.x += p.vx;
            p.y += p.vy;

            p.vx *= 0.93;
            p.vy *= 0.93;

            p.alpha -= p.decay;

            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
          }

          if (activeCount > 0) {
            animId = requestAnimationFrame(animate);
          }
        };

        animId = requestAnimationFrame(animate);
      }
    }

    // Complete transition after 1000ms (1 second fade-to-black)
    setTimeout(() => {
      onEnter();
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 w-full h-screen overflow-hidden bg-[#000000] select-none text-white font-inter flex flex-col items-center justify-between py-12 md:py-16"
      style={{ height: "100vh", minHeight: "100vh" }}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
          isEntering ? "scale-125 opacity-0 blur-3xl" : "scale-100 opacity-100"
        }`}
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
          type="video/mp4"
        />
      </video>

      {/* 150,000 Particle Shatter Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-50 pointer-events-none"
      />

      {/* Dark Ambient Overlay */}
      <div
        className={`absolute inset-0 z-10 pointer-events-none transition-all duration-1000 ease-in-out ${
          isEntering ? "bg-black/90 opacity-100" : "bg-black/25 opacity-100"
        }`}
      />

      {/* Ambient Radial Glow behind Name */}
      <div
        className={`absolute top-[20%] w-[700px] h-[350px] bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse z-10 transition-all duration-1000 ${
          isEntering ? "scale-150 opacity-0 blur-3xl" : "opacity-100"
        }`}
      />

      {/* Top/Center: Large Glass Text Name */}
      <div
        className={`relative z-20 pt-10 sm:pt-16 px-4 text-center transition-all duration-1000 ease-in-out ${
          isEntering
            ? "scale-150 opacity-0 blur-3xl -translate-y-16"
            : "scale-100 opacity-100 translate-y-0"
        }`}
      >
        <h1 className="glass-3d-text text-4xl sm:text-6xl md:text-7xl lg:text-[95px] tracking-widest whitespace-nowrap">
          JALOLIDDIN XALIMOV
        </h1>
      </div>

      {/* Bottom: Glass Effect Enter Button */}
      <div
        className={`relative z-20 pb-6 sm:pb-10 transition-all duration-1000 ease-in-out ${
          isEntering
            ? "scale-50 opacity-0 blur-3xl translate-y-16"
            : "scale-100 opacity-100 translate-y-0"
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

      {/* Final 1-Second Fade to Pitch Black Screen */}
      <div
        className={`fixed inset-0 z-50 bg-[#000000] pointer-events-none transition-opacity duration-1000 ease-in-out ${
          isEntering ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}