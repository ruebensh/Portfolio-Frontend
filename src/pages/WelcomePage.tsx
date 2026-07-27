import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, ArrowRight, ArrowDown } from "lucide-react";

interface WelcomePageProps {
  onEnter: () => void;
}

export function WelcomePage({ onEnter }: WelcomePageProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quoteSectionRef = useRef<HTMLDivElement | null>(null);

  // Parallax ref values for lerp smoothing
  const parallaxState = useRef({
    rainbowCurrentY: 120,
    leftCloudCurrentX: -200,
    leftCloudCurrentY: 0,
    leftCloudOpacity: 0,
    rightCloudCurrentX: 200,
    rightCloudCurrentY: 0,
    rightCloudOpacity: 0,
  });

  const rainbowRef = useRef<HTMLImageElement | null>(null);
  const leftCloudRef = useRef<HTMLImageElement | null>(null);
  const rightCloudRef = useRef<HTMLImageElement | null>(null);

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleEnter = () => {
    if (isEntering) return;
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
    }, 800);
  };

  const scrollToQuote = () => {
    if (quoteSectionRef.current) {
      quoteSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToHero = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 60fps rAF lerp Parallax effect
  useEffect(() => {
    let animId: number;

    const clamp = (val: number, min: number, max: number) =>
      Math.min(Math.max(val, min), max);

    const updateParallax = () => {
      const scrollEl = containerRef.current;
      const quoteEl = quoteSectionRef.current;

      if (scrollEl && quoteEl) {
        const windowHeight = window.innerHeight;
        const rect = quoteEl.getBoundingClientRect();

        // Calculate progress (0 to 1) based on quote section visibility
        const rawProgress = (windowHeight - rect.top) / (windowHeight + quoteEl.clientHeight);
        const progress = clamp(rawProgress, 0, 1);

        // Target calculations
        // 1. Rainbow: moves from +120px to -160px
        const rainbowTargetY = 120 + progress * (-160 - 120);

        // 2. Cloud visibility progress range (0.12 - 0.92)
        const inCloudRange = progress >= 0.12 && progress <= 0.92;
        const leftTargetX = inCloudRange ? 0 : -200;
        const rightTargetX = inCloudRange ? 0 : 200;
        const cloudTargetY = progress * -50;
        const cloudTargetOpacity = inCloudRange ? 1 : 0;

        // Lerp update (current + (target - current) * factor)
        const st = parallaxState.current;
        st.rainbowCurrentY += (rainbowTargetY - st.rainbowCurrentY) * 0.06;
        st.leftCloudCurrentX += (leftTargetX - st.leftCloudCurrentX) * 0.04;
        st.leftCloudCurrentY += (cloudTargetY - st.leftCloudCurrentY) * 0.04;
        st.leftCloudOpacity += (cloudTargetOpacity - st.leftCloudOpacity) * 0.04;

        st.rightCloudCurrentX += (rightTargetX - st.rightCloudCurrentX) * 0.04;
        st.rightCloudCurrentY += (cloudTargetY - st.rightCloudCurrentY) * 0.04;
        st.rightCloudOpacity += (cloudTargetOpacity - st.rightCloudOpacity) * 0.04;

        // Apply style transforms with GPU acceleration
        if (rainbowRef.current) {
          rainbowRef.current.style.transform = `translate3d(0, ${st.rainbowCurrentY}px, 0)`;
        }
        if (leftCloudRef.current) {
          leftCloudRef.current.style.transform = `translate3d(${st.leftCloudCurrentX}px, ${st.leftCloudCurrentY}px, 0)`;
          leftCloudRef.current.style.opacity = `${st.leftCloudOpacity}`;
        }
        if (rightCloudRef.current) {
          rightCloudRef.current.style.transform = `scaleX(-1) translate3d(${-st.rightCloudCurrentX}px, ${st.rightCloudCurrentY}px, 0)`;
          rightCloudRef.current.style.opacity = `${st.rightCloudOpacity}`;
        }
      }

      animId = requestAnimationFrame(updateParallax);
    };

    animId = requestAnimationFrame(updateParallax);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 h-screen w-full overflow-y-auto snap-y snap-mandatory bg-[#0a0608] select-none scrollbar-hide text-white font-inter"
    >
      {/* ─── FIXED NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 pointer-events-auto">
        {/* Brand Logo */}
        <div
          onClick={scrollToHero}
          className="font-dancing text-2xl md:text-3xl font-bold text-white tracking-wide cursor-pointer hover:opacity-90 transition-opacity"
        >
          Jaloliddin Xalimov
        </div>

        {/* Desktop CTA Button */}
        <div className="hidden md:block">
          <button
            onClick={handleEnter}
            className="bg-white text-black px-6 py-2.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow cursor-pointer"
          >
            Portfolioga kirish
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="md:hidden relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-[6px] focus:outline-none"
        >
          <span
            className={`w-6 h-[2px] bg-white rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              mobileMenuOpen ? "rotate-45 translate-y-[8px]" : ""
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              mobileMenuOpen ? "opacity-0 scale-0" : ""
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              mobileMenuOpen ? "-rotate-45 -translate-y-[8px]" : ""
            }`}
          />
        </button>

        {/* Mobile Slide-in Menu Panel */}
        <div
          className={`fixed inset-y-0 right-0 z-40 w-[85%] max-w-[340px] bg-[#0a0608]/95 backdrop-blur-xl border-l border-white/10 p-8 flex flex-col justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <h3 className="font-dancing text-3xl font-bold text-white">Jaloliddin Xalimov</h3>
            <p className="text-white/70 text-sm">AI & Full-Stack Engineer Portfolio</p>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleEnter();
              }}
              className="mt-6 w-full bg-white text-black py-3.5 rounded-full font-medium text-sm tracking-wide button-glow hover:bg-white/90 transition-all cursor-pointer"
            >
              Portfolioga kirish
            </button>
          </div>
        </div>
      </nav>

      {/* ─── SECTION 1: HERO ─── */}
      <section className="relative h-screen w-full snap-start flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />

        {/* Center Content */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 -mt-[40px] md:-mt-[80px] max-w-5xl mx-auto">
          {/* Main Name Heading */}
          <h1 className="font-instrument text-white text-[42px] sm:text-6xl md:text-8xl lg:text-[110px] leading-[0.95] tracking-tight text-center text-glow">
            Jaloliddin Xalimov
          </h1>

          {/* Subtext */}
          <p className="text-white/80 text-base md:text-xl text-center mt-5 md:mt-7 max-w-xl font-normal leading-relaxed tracking-wide">
            AI & Full-Stack Engineer
          </p>

          {/* CTA Button */}
          <button
            onClick={handleEnter}
            className="bg-white text-black px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow mt-8 md:mt-10 flex items-center gap-2 hover:scale-105 cursor-pointer"
          >
            <span>Portfolioga kirish</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Sound Indicator (Desktop only) */}
        <div className="hidden md:flex absolute bottom-8 left-8 z-20 items-center gap-3">
          <button
            onClick={handleToggleMute}
            className="w-10 h-10 rounded-full border border-white/20 hover:border-white/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
            title={isMuted ? "Sound on" : "Sound off"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <div className="text-white/60 text-xs leading-tight font-light">
            <div>Experience</div>
            <div>with sound</div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div
          onClick={scrollToQuote}
          className="absolute bottom-8 right-8 md:right-12 z-20 flex items-center gap-2 text-white/60 hover:text-white text-xs tracking-wider uppercase cursor-pointer transition-colors"
        >
          <span>Scroll down</span>
          <ArrowDown size={14} className="animate-bounce" />
        </div>
      </section>

      {/* ─── SECTION 2: QUOTE SECTION (PARALLAX SCROLL) ─── */}
      <section
        ref={quoteSectionRef}
        className="relative h-screen w-full snap-start flex items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom, #010A17 0%, #0A4267 30%, #20658E 60%, #6BADC4 100%)",
        }}
      >
        {/* Rainbow Image Parallax Layer */}
        <img
          ref={rainbowRef}
          src="https://soft-zoom-63098134.figma.site/_assets/v11/8d520a7515d06cbfc403d0125e3d05b1a7ccd29c.png"
          alt="Rainbow"
          className="absolute inset-x-0 top-0 z-30 pointer-events-none w-full object-cover will-change-transform"
          style={{ transform: "translate3d(0, 120px, 0)" }}
        />

        {/* Left Cloud Image Parallax Layer */}
        <img
          ref={leftCloudRef}
          src="https://soft-zoom-63098134.figma.site/_assets/v11/0d6dfd3f90b930f21726f2ed56a3320d79b7a797.png"
          alt="Left Cloud"
          className="absolute left-0 bottom-[10%] z-10 hidden sm:block w-[500px] md:w-[650px] pointer-events-none will-change-transform opacity-0"
          style={{
            marginLeft: "-50%",
            transform: "translate3d(-200px, 0, 0)",
          }}
        />

        {/* Right Cloud Image Parallax Layer (Flipped) */}
        <img
          ref={rightCloudRef}
          src="https://soft-zoom-63098134.figma.site/_assets/v11/0d6dfd3f90b930f21726f2ed56a3320d79b7a797.png"
          alt="Right Cloud"
          className="absolute right-0 bottom-[15%] z-10 hidden sm:block w-[500px] md:w-[650px] pointer-events-none will-change-transform opacity-0"
          style={{
            marginRight: "-75%",
            transform: "scaleX(-1) translate3d(-200px, 0, 0)",
          }}
        />

        {/* Pure Content Layer */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-6 max-w-4xl mx-auto">
          {/* Main Title */}
          <h2 className="font-instrument text-white text-3xl sm:text-5xl md:text-6xl leading-[1.3] font-normal tracking-wide text-glow">
            Building Modern AI Solutions & Web Products
          </h2>

          {/* Action CTA to Enter Portfolio */}
          <button
            onClick={handleEnter}
            className="mt-8 md:mt-12 bg-white text-black px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow flex items-center gap-2 hover:scale-105 cursor-pointer"
          >
            <span>Portfolioga kirish</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ─── TRANSITION FADE OVERLAY ─── */}
      <div
        className={`fixed inset-0 z-50 bg-[#0a0608] pointer-events-none transition-opacity duration-700 ${
          isEntering ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}