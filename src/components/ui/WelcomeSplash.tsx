"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MagicTextReveal from "@/components/originkit/ui/dust-text-reveal";

export const WelcomeSplash = ({ children }: { children: React.ReactNode }) => {
  const [showSplash, setShowSplash] = useState(false);
  const [activeStage, setActiveStage] = useState<"enter" | "exit">("enter");
  const [fontSize, setFontSize] = useState("64px");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeen = sessionStorage.getItem("devini_welcome_seen");
      if (!hasSeen) {
        setShowSplash(true);
        sessionStorage.setItem("devini_welcome_seen", "true");
      }

      const updateFontSize = () => {
        if (window.innerWidth < 640) {
          setFontSize("32px");
        } else if (window.innerWidth < 1024) {
          setFontSize("54px");
        } else {
          setFontSize("76px");
        }
      };

      updateFontSize();
      window.addEventListener("resize", updateFontSize);
      return () => window.removeEventListener("resize", updateFontSize);
    }
  }, []);

  useEffect(() => {
    if (!showSplash) return;

    // Timeline (Total 5 Seconds):
    // 0s - 2s: Particles assemble into large text
    // 2s - 3s: Text stays fully visible (1 sec hold)
    // 3s - 5s: Particles disperse back to dust
    const startDisperseTimer = setTimeout(() => {
      setActiveStage("exit");
    }, 3000);

    const endSplashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => {
      clearTimeout(startDisperseTimer);
      clearTimeout(endSplashTimer);
    };
  }, [showSplash]);

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <motion.div
            key="welcome-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.9, ease: "easeInOut" } }}
            className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center p-4 overflow-hidden select-none"
          >
            {/* Background Video matching the site theme */}
            <video
              autoPlay
              muted
              playsInline
              loop
              className="absolute inset-0 w-full h-full object-cover opacity-40 blur-md scale-105 pointer-events-none"
            >
              <source src="/backgrounds/welcome.mp4" type="video/mp4" />
              <source src="/backgrounds/1.mp4" type="video/mp4" />
            </video>

            {/* Dark Ambient Backdrop & Neon Glow Blobs */}
            <div className="absolute inset-0 bg-black/50 backdrop-brightness-90 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[800px] h-[500px] sm:h-[800px] bg-[#F4C95D]/8 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#F4C95D]/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Cyber Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] sm:bg-[size:48px_48px] pointer-events-none" />

            {/* Dust Text Reveal Large Text Component */}
            <div className="relative z-20 w-full max-w-4xl h-44 sm:h-64 flex items-center justify-center px-4">
              <MagicTextReveal
                key={activeStage}
                text="Xush Kelibsiz • Welcome"
                color="rgba(244, 201, 93, 0.95)"
                font={{
                  fontFamily: "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif",
                  fontSize: fontSize,
                  fontWeight: 800,
                  textAlign: "center",
                  letterSpacing: "0.02em",
                }}
                transition={{ type: "tween", duration: 2.0, ease: "easeInOut" }}
                density={9}
                noise={60}
                playMode={activeStage === "enter" ? "enter" : "hover"}
                resetOnMouseLeave={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
};
