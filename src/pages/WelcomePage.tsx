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
    setTimeout(() => {
      onEnter();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 w-full h-screen overflow-hidden bg-[#0a0608] select-none text-white font-inter flex items-center justify-center"
      style={{ height: "100vh", minHeight: "100vh" }}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark Ambient Overlay */}
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] z-10 pointer-events-none" />

      {/* Ambient background glow */}
      <div className="absolute w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse z-10" />

      {/* Center Ultra-Clean Glass Card */}
      <div
        className={`relative z-20 flex flex-col items-center justify-center text-center px-8 py-14 sm:px-16 sm:py-20 rounded-[3rem] liquid-glass border border-white/20 shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-700 max-w-[90vw] sm:max-w-3xl ${
          isEntering
            ? "scale-110 opacity-0 blur-md pointer-events-none"
            : "hover:border-white/35"
        }`}
        style={{
          boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 25px 90px rgba(0, 0, 0, 0.7)",
        }}
      >
        {/* Shimmer top border line */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        {/* Large Glass Text Name */}
        <h1 className="font-instrument text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-white/60 drop-shadow-[0_10px_35px_rgba(255,255,255,0.35)] text-glow py-2">
          Jaloliddin Xalimov
        </h1>

        {/* Glass Effect Enter Button */}
        <button
          onClick={handleEnter}
          className="mt-8 sm:mt-12 liquid-glass border border-white/30 bg-white/10 hover:bg-white/25 hover:border-white/50 text-white px-9 py-4 rounded-full font-semibold text-sm sm:text-base tracking-wider button-glow flex items-center gap-3 hover:scale-105 transition-all cursor-pointer group shadow-2xl backdrop-blur-md"
        >
          <span>Portfolioga kirish</span>
          <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
        </button>
      </div>

      {/* Transition Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-[#0a0608] pointer-events-none transition-opacity duration-700 ${
          isEntering ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}