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
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
          type="video/mp4"
        />
      </video>

      {/* Subtle Dark Ambient Overlay */}
      <div className="absolute inset-0 bg-black/25 z-10 pointer-events-none" />

      {/* Ambient Radial Glow behind Name */}
      <div className="absolute top-[20%] w-[700px] h-[350px] bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse z-10" />

      {/* Top/Center: Large Glass Text Name */}
      <div
        className={`relative z-20 pt-10 sm:pt-16 px-4 text-center transition-all duration-700 ${
          isEntering ? "opacity-0 -translate-y-12 blur-md" : "opacity-100 translate-y-0"
        }`}
      >
        <h1 className="glass-3d-text text-4xl sm:text-6xl md:text-7xl lg:text-[95px] tracking-widest whitespace-nowrap">
          JALOLIDDIN XALIMOV
        </h1>
      </div>

      {/* Bottom: Glass Effect Enter Button */}
      <div
        className={`relative z-20 pb-6 sm:pb-10 transition-all duration-700 ${
          isEntering ? "opacity-0 translate-y-12 blur-md" : "opacity-100 translate-y-0"
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
        className={`fixed inset-0 z-50 bg-[#0a0608] pointer-events-none transition-opacity duration-700 ${
          isEntering ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}