import { useState, useEffect, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface WelcomePageProps {
  onEnter: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const WelcomePage: React.FC<WelcomePageProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  const handleStart = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 800);
  }, [isExiting, onEnter]);

  const brandName = settings?.author || "Jaloliddin Xalimov";

  return (
    <div className="relative w-full h-screen bg-[#0a0608] overflow-hidden select-none font-inter">
      {/* ─── 1. Background Video (Rotating Earth) ─── */}
      <video
        autoPlay
        loop
        muted={isMuted}
        playsInline
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* ─── 2. Dark Overlay ─── */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* ─── 3. Fixed Navbar ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5">
        {/* Left: Brand Name in Dancing Script */}
        <div className="font-dancing text-white text-2xl md:text-3xl tracking-wide drop-shadow-md">
          {brandName}
        </div>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-12">
          {["About", "Projects", "Services", "Contact"].map((link) => (
            <button
              key={link}
              onClick={handleStart}
              className="text-white/80 hover:text-white text-sm tracking-wide transition-colors cursor-pointer"
            >
              {link}
            </button>
          ))}
        </nav>

        {/* Right: Desktop Pill Button */}
        <div className="hidden md:block">
          <button
            onClick={handleStart}
            className="bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow cursor-pointer"
          >
            Portfolioga kirish
          </button>
        </div>

        {/* Right: Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          className="md:hidden z-50 relative w-10 h-10 flex flex-col justify-center items-center gap-[6px] focus:outline-none"
        >
          <span
            className={`w-6 h-[2px] bg-white rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isMobileMenuOpen ? "rotate-45 translate-y-[8px]" : ""
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isMobileMenuOpen ? "opacity-0 scale-0" : ""
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-[8px]" : ""
            }`}
          />
        </button>
      </header>

      {/* ─── Mobile Slide-in Drawer ─── */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-40 w-[85%] max-w-[340px] bg-[#0a0608]/95 backdrop-blur-xl border-l border-white/10 p-8 flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="pt-20 flex flex-col gap-6">
          {["About", "Projects", "Services", "Contact"].map((link, idx) => (
            <button
              key={link}
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleStart();
              }}
              style={{
                transitionDelay: `${150 + idx * 75}ms`,
              }}
              className={`text-left text-white text-xl font-light tracking-wide hover:text-white/70 transition-all duration-300 ${
                isMobileMenuOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-4"
              }`}
            >
              {link}
            </button>
          ))}
        </div>

        <div
          style={{ transitionDelay: "450ms" }}
          className={`transition-all duration-300 ${
            isMobileMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleStart();
            }}
            className="w-full bg-white text-black py-4 rounded-full font-medium text-sm tracking-wide button-glow cursor-pointer text-center"
          >
            Portfolioga kirish
          </button>
        </div>
      </div>

      {/* ─── 4. Center Content ─── */}
      <main className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center -mt-[60px] md:-mt-[120px] pointer-events-none">
        <h1 className="font-instrument text-white text-[36px] md:text-7xl lg:text-[110px] leading-[0.9] tracking-tight text-center text-glow max-w-5xl pointer-events-auto">
          Gentle touch. Radiant presence.
        </h1>

        <p className="text-white/70 text-sm md:text-base text-center mt-5 md:mt-7 max-w-xl pointer-events-auto font-light">
          Expert software engineering & AI solutions, delivered with warmth and intention.
        </p>

        <div className="mt-6 md:mt-9 pointer-events-auto">
          <button
            onClick={handleStart}
            className="bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow cursor-pointer"
          >
            Begin your renewal
          </button>
        </div>
      </main>

      {/* ─── 5. Sound Indicator (Desktop Only) ─── */}
      <div className="hidden md:flex absolute bottom-8 left-8 z-30 items-center gap-3">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:border-white/40 transition-all cursor-pointer backdrop-blur-sm bg-white/5"
          title={isMuted ? "Unmute sound" : "Mute sound"}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <div className="text-white/60 text-xs leading-tight font-light">
          <div>Experience</div>
          <div>{isMuted ? "without sound" : "with sound"}</div>
        </div>
      </div>

      {/* ─── Transition Exit Overlay ─── */}
      <div
        className={`absolute inset-0 z-50 bg-[#0a0608] pointer-events-none transition-opacity duration-700 ease-in-out ${
          isExiting ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};