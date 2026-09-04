"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, CheckCircle, CircleNotch } from "@phosphor-icons/react/dist/ssr";

export function GlobalPreloader() {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("TIZIM ISHGA TUSHMOQDA...");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if preloader already ran in this tab session
    const hasPreloaded = sessionStorage.getItem("devini_preloaded_session");
    if (hasPreloaded === "true") {
      setIsCompleted(true);
      return;
    }

    const mobileCheck = typeof window !== "undefined" && window.innerWidth < 768;
    setIsMobile(mobileCheck);

    // Build frame URL lists for preloading
    const frameUrls: string[] = [];

    // 1. Hero Frames (1 to 120)
    const heroStep = mobileCheck ? 6 : 2;
    for (let i = 1; i <= 120; i += heroStep) {
      frameUrls.push(`/frames/frame_${String(i).padStart(4, "0")}.jpg`);
    }

    // 2. Skill Frames (24 to 212)
    const skillStep = mobileCheck ? 8 : 2;
    for (let i = 24; i <= 212; i += skillStep) {
      frameUrls.push(`/skill-frames/frame_${String(i).padStart(4, "0")}.jpg`);
    }

    // 3. Tunnel Frames (1 to 100)
    const tunnelStep = mobileCheck ? 6 : 2;
    for (let i = 1; i <= 100; i += tunnelStep) {
      frameUrls.push(`/tunnel-frames/frame_${String(i).padStart(4, "0")}.jpg`);
    }

    const totalAssets = frameUrls.length;
    let loadedAssets = 0;

    const updateProgress = () => {
      loadedAssets++;
      const currentPct = Math.min(100, Math.round((loadedAssets / totalAssets) * 100));
      setProgress(currentPct);

      if (currentPct < 30) {
        setStatusText("3D ENGINES & GRAPHICS INITIALIZING...");
      } else if (currentPct < 70) {
        setStatusText(`CINEMATIC FRAMES PRELOADING (${loadedAssets}/${totalAssets})...`);
      } else if (currentPct < 98) {
        setStatusText("FINALIZING 60 FPS SCROLL PIPELINE...");
      } else {
        setStatusText("SAYT ISHGA TUSHISHGA TAYYOR!");
      }

      if (loadedAssets >= totalAssets) {
        finishPreloading();
      }
    };

    const finishPreloading = () => {
      setProgress(100);
      setStatusText("TAYYOR!");
      setTimeout(() => {
        sessionStorage.setItem("devini_preloaded_session", "true");
        setIsCompleted(true);
      }, 500);
    };

    // Preload images in parallel
    frameUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = updateProgress;
      img.onerror = updateProgress; // Don't block loading if single frame misses
    });

    // Fallback safety timeout (Max 3.5 seconds)
    const timeout = setTimeout(() => {
      finishPreloading();
    }, 3500);

    return () => clearTimeout(timeout);
  }, []);

  if (isCompleted) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#040409] text-white p-6 select-none overflow-hidden"
      >
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-accent/15 blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-purple-600/15 blur-[120px] pointer-events-none animate-pulse" />

        {/* Central Futuristic Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative max-w-md w-full p-8 md:p-10 rounded-3xl border border-white/15 bg-[#0a0a16]/90 backdrop-blur-2xl shadow-[0_0_60px_rgba(244,201,93,0.15)] text-center space-y-6 overflow-hidden"
        >
          {/* Top Telemetry Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent/40 bg-accent/10 text-accent font-mono text-[10px] uppercase tracking-widest font-bold">
            <Cpu size={14} className="animate-spin" />
            <span>NEXUS PRELOADER • 60 FPS ENGINE</span>
          </div>

          {/* Title */}
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
              Jaloliddin Xalimov
            </h1>
            <p className="font-mono text-xs text-muted uppercase tracking-widest mt-1">
              Data Science • ML • AI Engineering
            </p>
          </div>

          {/* Radial / Progress Visual */}
          <div className="relative py-4 flex flex-col items-center justify-center">
            {/* Animated Ring */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-white/10 fill-none"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-accent fill-none transition-all duration-200 ease-out"
                  strokeWidth="6"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * progress) / 100}
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                <span className="text-3xl font-bold text-white tracking-tighter">
                  {progress}%
                </span>
                {isMobile && (
                  <span className="text-[9px] text-accent/80 uppercase font-bold">Mobile Tier</span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-accent to-emerald-400 shadow-[0_0_12px_rgba(244,201,93,0.8)]"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Dynamic Status Text */}
            <p className="font-mono text-[11px] text-muted tracking-wider uppercase h-6 flex items-center justify-center gap-1.5 truncate">
              {progress < 100 ? (
                <>
                  <CircleNotch size={14} className="animate-spin text-accent" />
                  <span className="truncate">{statusText}</span>
                </>
              ) : (
                <>
                  <CheckCircle size={14} className="text-emerald-400" />
                  <span className="text-emerald-400 font-bold">TAYYOR! SAYTGA KIRILMOQDA...</span>
                </>
              )}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
