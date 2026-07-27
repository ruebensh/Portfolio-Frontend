import React, { useState, useEffect, useRef, useCallback } from "react";

interface WelcomePageProps {
  onEnter: () => void;
}

// ─── Button Component ───
const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow cursor-pointer ${className}`}
  >
    {children}
  </button>
);

// ─── SECTION 1: Hero ───
const Hero: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-[#0a0608]">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Fixed Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5">
        {/* Brand */}
        <span className="font-dancing text-white text-2xl md:text-3xl select-none">
          Serene
        </span>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-12">
          {["About", "Services", "Journal", "Contact"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-white/80 hover:text-white text-sm tracking-wide transition-colors"
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Desktop Right Button */}
        <div className="hidden md:block">
          <Button onClick={onEnter}>Book a consultation</Button>
        </div>

        {/* Mobile Hamburger Icon */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden relative z-50 w-10 h-10 flex flex-col justify-center items-center gap-1.5 focus:outline-none cursor-pointer"
          aria-label="Toggle Menu"
        >
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              mobileMenuOpen ? "rotate-45 translate-y-[8px]" : ""
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              mobileMenuOpen ? "opacity-0 scale-0" : ""
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              mobileMenuOpen ? "-rotate-45 -translate-y-[8px]" : ""
            }`}
          />
        </button>

        {/* Mobile Slide-in Menu */}
        <div
          className={`fixed inset-y-0 right-0 z-40 w-[85%] max-w-[340px] bg-[#0a0608]/95 backdrop-blur-xl border-l border-white/10 flex flex-col justify-between p-8 pt-24 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col gap-6">
            {["About", "Services", "Journal", "Contact"].map((link, idx) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/90 hover:text-white text-xl tracking-wide font-light transition-all"
                style={{
                  transitionDelay: `${150 + idx * 75}ms`,
                  opacity: mobileMenuOpen ? 1 : 0,
                  transform: mobileMenuOpen ? "translateX(0)" : "translateX(20px)",
                }}
              >
                {link}
              </a>
            ))}
          </div>

          <div
            style={{
              transitionDelay: "450ms",
              opacity: mobileMenuOpen ? 1 : 0,
              transform: mobileMenuOpen ? "translateY(0)" : "translateY(20px)",
              transitionProperty: "opacity, transform",
              transitionDuration: "400ms",
            }}
          >
            <Button onClick={() => { setMobileMenuOpen(false); onEnter(); }} className="w-full">
              Book a consultation
            </Button>
          </div>
        </div>
      </header>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 -mt-[120px] pointer-events-auto z-20">
        <h1 className="font-instrument text-white text-[36px] md:text-7xl lg:text-[110px] leading-[0.9] tracking-tight text-center text-glow">
          Gentle touch. Radiant presence.
        </h1>
        <p className="text-white/70 text-sm md:text-base text-center mt-5 md:mt-7 max-w-xl">
          Expert beauty and holistic wellness, delivered with warmth and intention.
        </p>
        <Button onClick={onEnter} className="mt-6 md:mt-9">
          Begin your renewal
        </Button>
      </div>

      {/* Sound Indicator (Desktop only) */}
      <div className="hidden md:flex items-center gap-3 absolute bottom-8 left-8 z-20 pointer-events-none">
        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
          <div className="w-3 h-[2px] bg-white/80 rounded-full animate-pulse" />
        </div>
        <div className="text-white/60 text-xs leading-tight">
          <div>Experience</div>
          <div>with sound</div>
        </div>
      </div>
    </section>
  );
};

// ─── SECTION 2: Quote Section (Parallax Scroll) ───
const QuoteSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const rainbowRef = useRef<HTMLImageElement>(null);
  const leftCloudRef = useRef<HTMLImageElement>(null);
  const rightCloudRef = useRef<HTMLImageElement>(null);

  // Parallax targets & current values for smooth lerp
  const animState = useRef({
    targetProgress: 0,
    currentProgress: 0,
    rainbowY: 120,
    leftX: -200,
    rightX: 200,
    leftOpacity: 0,
    rightOpacity: 0,
    cloudY: 0,
  });

  const updateParallax = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Progress bounded 0 to 1
    const rawProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
    const progress = Math.max(0, Math.min(1, rawProgress));
    animState.current.targetProgress = progress;

    // Lerp calculation
    const state = animState.current;
    state.currentProgress += (state.targetProgress - state.currentProgress) * 0.06;

    // Rainbow Y movement: +120px down to -160px
    state.rainbowY = 120 - state.currentProgress * 280;

    // Cloud activation range: progress 0.12 - 0.92
    const inView = state.currentProgress > 0.08 && state.currentProgress < 0.95;
    const targetCloudX = inView ? 0 : 200;
    const targetCloudOpacity = inView ? 1 : 0;

    state.leftX += (-targetCloudX - state.leftX) * 0.04;
    state.rightX += (targetCloudX - state.rightX) * 0.04;
    state.leftOpacity += (targetCloudOpacity - state.leftOpacity) * 0.05;
    state.rightOpacity += (targetCloudOpacity - state.rightOpacity) * 0.05;
    state.cloudY = state.currentProgress * -50;

    // Apply GPU accelerated transforms
    if (rainbowRef.current) {
      rainbowRef.current.style.transform = `translate3d(0, ${state.rainbowY}px, 0)`;
    }
    if (leftCloudRef.current) {
      leftCloudRef.current.style.transform = `translate3d(${state.leftX}px, ${state.cloudY}px, 0)`;
      leftCloudRef.current.style.opacity = `${state.leftOpacity}`;
    }
    if (rightCloudRef.current) {
      rightCloudRef.current.style.transform = `scaleX(-1) translate3d(${state.rightX}px, ${state.cloudY}px, 0)`;
      rightCloudRef.current.style.opacity = `${state.rightOpacity}`;
    }
  }, []);

  useEffect(() => {
    let animFrameId: number;

    const loop = () => {
      updateParallax();
      animFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => cancelAnimationFrame(animFrameId);
  }, [updateParallax]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden flex items-center justify-center"
      style={{
        background: "linear-gradient(180deg, #010A17 0%, #0A4267 30%, #20658E 60%, #6BADC4 100%)",
      }}
    >
      {/* 1. Rainbow Image */}
      <img
        ref={rainbowRef}
        src="https://soft-zoom-63098134.figma.site/_assets/v11/8d520a7515d06cbfc403d0125e3d05b1a7ccd29c.png"
        alt="Rainbow"
        className="absolute inset-x-0 top-0 w-full z-30 pointer-events-none will-change-transform"
      />

      {/* 2. Left Cloud */}
      <img
        ref={leftCloudRef}
        src="https://soft-zoom-63098134.figma.site/_assets/v11/0d6dfd3f90b930f21726f2ed56a3320d79b7a797.png"
        alt="Cloud Left"
        className="absolute left-0 bottom-[10%] z-10 hidden sm:block w-[500px] md:w-[650px] pointer-events-none will-change-transform"
        style={{ marginLeft: "-50%" }}
      />

      {/* 3. Right Cloud */}
      <img
        ref={rightCloudRef}
        src="https://soft-zoom-63098134.figma.site/_assets/v11/0d6dfd3f90b930f21726f2ed56a3320d79b7a797.png"
        alt="Cloud Right"
        className="absolute right-0 bottom-[15%] z-10 hidden sm:block w-[500px] md:w-[650px] pointer-events-none will-change-transform"
        style={{ marginRight: "-75%" }}
      />

      {/* 4. Quote Content */}
      <div className="relative z-20 max-w-4xl text-center px-6 md:px-10 py-12">
        <blockquote className="font-instrument text-white text-xl sm:text-2xl md:text-4xl lg:text-[42px] leading-[1.45] md:leading-[1.5]">
          “Serene was founded on a belief in beauty that honors your nature. We
          pursue refined outcomes, considered approaches, and lasting vitality. We
          spend time learning what matters to you before deciding what serves you
          best. No rushing, no excess -- just support that lets you feel
          radiant.”
        </blockquote>
        <div className="mt-6 md:mt-8 text-white/80 text-sm md:text-base tracking-wide font-sans">
          Dr. Mia Callahan -- Founder
        </div>
      </div>
    </section>
  );
};

// ─── Main WelcomePage Export ───
export const WelcomePage: React.FC<WelcomePageProps> = ({ onEnter }) => {
  return (
    <div className="bg-[#0a0608] min-h-screen w-full select-none overflow-x-hidden font-inter">
      <Hero onEnter={onEnter} />
      <QuoteSection />
    </div>
  );
};