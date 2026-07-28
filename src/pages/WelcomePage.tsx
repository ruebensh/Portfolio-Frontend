import { useState, useRef } from "react";
import { ArrowRight } from "lucide-react";

interface WelcomePageProps {
  onEnter: () => void;
}

export function WelcomePage({ onEnter }: WelcomePageProps) {
  const [isEntering, setIsEntering] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleEnter = () => {
    if (isEntering) return;
    setIsEntering(true);

    // 2 soniyalik silliq qorong'ulashtirish (fade to black) effekti tugagach onEnter chaqiriladi
    setTimeout(() => {
      onEnter();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-screen overflow-hidden bg-black select-none flex items-center justify-center">
      {/* ── Full-Screen Background Video ─────────────────────────────── */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onEnded={handleEnter}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-[2000ms] ease-in-out ${
          isEntering ? "scale-110 blur-2xl opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <source src="/backgrounds/welcome.mp4" type="video/mp4" />
        <source src="/backgrounds/1.mp4" type="video/mp4" />
      </video>

      {/* Yengil ambient va gradient scrim */}
      <div className="absolute inset-0 z-10 bg-black/30 pointer-events-none" />

      {/* ── Ekran Markazida Faqat Bitta ENTER PORTFOLIO Tugmasi ──────── */}
      <div
        className={`relative z-20 transition-all duration-[2000ms] ease-in-out ${
          isEntering
            ? "scale-75 opacity-0 blur-xl translate-y-6"
            : "scale-100 opacity-100 translate-y-0"
        }`}
      >
        <button
          onClick={handleEnter}
          className="glass-3d-button text-white px-12 py-5 rounded-full font-bold text-lg sm:text-xl tracking-[0.25em] uppercase flex items-center gap-4 cursor-pointer group shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        >
          <span>ENTER PORTFOLIO</span>
          <ArrowRight
            size={22}
            className="group-hover:translate-x-2 transition-transform duration-300"
          />
        </button>
      </div>

      {/* ── Fade-to-Black Overlay ──────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 bg-black pointer-events-none transition-opacity duration-[2000ms] ease-in-out ${
          isEntering ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}