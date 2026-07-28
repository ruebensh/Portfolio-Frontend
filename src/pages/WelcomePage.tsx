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

const NAV_LINKS = ["Work", "About", "Skills", "Contact"];

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

        for (let i = 0; i < particleCount; i++) {
          const px = Math.random() * width;
          const py = Math.random() * height;
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 20 + 3;

          particles.push({
            x: px,
            y: py,
            vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 5,
            vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 5,
            size: Math.random() * 2.2 + 0.6,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: Math.random() * 0.85 + 0.15,
            decay: Math.random() * 0.007 + 0.003,
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
            p.vx *= 0.95;
            p.vy *= 0.95;
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

    setTimeout(() => {
      onEnter();
    }, 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 w-full overflow-hidden bg-black select-none text-white"
      style={{ height: "100vh", minHeight: "100vh" }}
    >
      {/* ── Full-Screen Video Background ─────────────────────────────── */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-[2500ms] ease-in-out ${
          isEntering ? "scale-150 opacity-0 blur-3xl" : "scale-100 opacity-100"
        }`}
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
          type="video/mp4"
        />
      </video>

      {/* Particle canvas (above video, below UI) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-30 pointer-events-none"
      />

      {/* Gradient scrim — heavier at bottom for text legibility */}
      <div
        className={`absolute inset-0 z-10 pointer-events-none transition-all duration-[2500ms] ease-in-out ${
          isEntering
            ? "bg-black/95 backdrop-blur-3xl opacity-100"
            : "opacity-100"
        }`}
        style={{
          background: isEntering
            ? undefined
            : "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.38) 45%, rgba(0,0,0,0.18) 100%)",
        }}
      />

      {/* ── Glassmorphic Nav Header ───────────────────────────────────── */}
      <header
        className={`absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 sm:px-10 lg:px-16 h-16 sm:h-20 transition-all duration-[2500ms] ease-in-out ${
          isEntering ? "opacity-0 -translate-y-6 blur-lg" : "opacity-100 translate-y-0"
        }`}
      >
        {/* Logo / wordmark */}
        <div className="flex items-center gap-2.5">
          <span className="text-xl sm:text-2xl font-black tracking-widest uppercase"
            style={{
              background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.55) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            J·X
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <span
              key={link}
              className="text-sm font-medium tracking-widest uppercase text-white/70 hover:text-white transition-colors duration-200 cursor-default"
            >
              {link}
            </span>
          ))}
        </nav>

        {/* CTA pill */}
        <button
          onClick={handleEnter}
          className="glass-nav-pill hidden sm:flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-widest uppercase text-white"
        >
          <span>View Portfolio</span>
          <ArrowRight size={14} />
        </button>

        {/* Mobile — hamburger placeholder */}
        <div className="flex sm:hidden flex-col gap-1.5 cursor-default" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="block w-6 h-[2px] bg-white/70 rounded-full" />
          ))}
        </div>
      </header>

      {/* ── Hero Content — bottom-left ────────────────────────────────── */}
      <div
        className={`absolute bottom-0 left-0 z-20 px-6 sm:px-10 lg:px-16 pb-10 sm:pb-14 lg:pb-16 flex flex-col gap-5 sm:gap-6 transition-all duration-[2500ms] ease-in-out ${
          isEntering
            ? "opacity-0 translate-y-10 blur-xl"
            : "opacity-100 translate-y-0"
        }`}
      >
        {/* Eyebrow tag */}
        <div className="welcome-eyebrow inline-flex self-start items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Full-Stack Developer &amp; Designer
        </div>

        {/* Name — large glass text */}
        <div>
          <h1
            className="glass-3d-text leading-none"
            style={{ fontSize: "clamp(2.4rem, 6.5vw, 7rem)" }}
          >
            Jaloliddin
          </h1>
          <h1
            className="glass-3d-text leading-none"
            style={{ fontSize: "clamp(2.4rem, 6.5vw, 7rem)" }}
          >
            Xalimov
          </h1>
        </div>

        {/* Short descriptor */}
        <p className="text-white/60 text-sm sm:text-base max-w-sm leading-relaxed">
          Crafting premium digital experiences — from concept to pixel-perfect execution.
        </p>

        {/* CTA row */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={handleEnter}
            className="glass-3d-button text-white px-8 py-3.5 rounded-full font-bold text-sm sm:text-base tracking-widest uppercase flex items-center gap-3 cursor-pointer group"
          >
            <span>Enter Portfolio</span>
            <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
          </button>

          <span className="text-white/35 text-xs tracking-widest uppercase font-medium select-none">
            Scroll to explore ↓
          </span>
        </div>
      </div>

      {/* Final black fade overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black pointer-events-none transition-opacity duration-[2500ms] ease-in-out ${
          isEntering ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}