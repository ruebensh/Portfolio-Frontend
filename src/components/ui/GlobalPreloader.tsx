"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, CheckCircle, CircleNotch } from "@phosphor-icons/react/dist/ssr";

// Global cache for preloaded HTMLImageElements
declare global {
  interface Window {
    __RUEBENSH_FRAME_CACHE__?: Record<string, HTMLImageElement>;
  }
}

export function GlobalPreloader() {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("ASOSIY SAHIFA MATERIALLARI TAYYORLANMOQDA...");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [totalCount, setTotalCount] = useState(300);
  const [loadedCount, setLoadedCount] = useState(0);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Check device type
    const mobileCheck = typeof window !== "undefined" && window.innerWidth < 768;
    setIsMobile(mobileCheck);

    // Build frame URL lists for preloading
    const frameUrls: string[] = [];

    if (mobileCheck) {
      // Mobile: lighter preload to save bandwidth (initial hero frames + teaser)
      for (let i = 1; i <= 40; i += 2) {
        frameUrls.push(`/frames/frame_${String(i).padStart(4, "0")}.jpg`);
      }
    } else {
      // Desktop: All 300 Hero Frames for smooth 60 FPS cinematic playback
      for (let i = 1; i <= 300; i++) {
        frameUrls.push(`/frames/frame_${String(i).padStart(4, "0")}.jpg`);
      }
    }

    const totalAssets = frameUrls.length;
    setTotalCount(totalAssets);

    // Initialize global frame cache
    if (typeof window !== "undefined") {
      window.__RUEBENSH_FRAME_CACHE__ = window.__RUEBENSH_FRAME_CACHE__ || {};
    }

    let loaded = 0;
    let currentIndex = 0;
    const CONCURRENCY = mobileCheck ? 8 : 18; // Parallel load streams

    const updateProgressUI = (currentLoaded: number, total: number) => {
      if (!isMountedRef.current) return;
      const pct = Math.min(100, Math.round((currentLoaded / total) * 100));
      setProgress(pct);
      setLoadedCount(currentLoaded);

      if (pct < 25) {
        setStatusText("ASOSIY SAHIFA FREYMLARI YUKLANMOQDA...");
      } else if (pct < 75) {
        setStatusText(`HERO KINEMATIK FREYMLARI (${currentLoaded}/${total})...`);
      } else if (pct < 100) {
        setStatusText(`60 FPS RENDER QUVMASI SOZLANMOQDA (${pct}%)...`);
      } else {
        setStatusText("ASOSIY SAHIFA TO'LIQ TAYYOR!");
      }
    };

    const finishPreloading = () => {
      if (!isMountedRef.current) return;
      setProgress(100);
      setStatusText("ASOSIY SAHIFA TO'LIQ TAYYOR!");
      setTimeout(() => {
        if (isMountedRef.current) {
          setIsCompleted(true);
        }
      }, 450);
    };

    // Worker queue with concurrency pool
    const loadNext = (): Promise<void> => {
      if (currentIndex >= totalAssets) return Promise.resolve();

      const index = currentIndex++;
      const url = frameUrls[index];

      return new Promise<void>((resolve) => {
        // If already cached and ready
        const cached = window.__RUEBENSH_FRAME_CACHE__?.[url];
        if (cached && (cached.complete || cached.naturalWidth > 0)) {
          loaded++;
          updateProgressUI(loaded, totalAssets);
          resolve();
          return;
        }

        const img = new Image();
        img.decoding = "async";

        const handleComplete = () => {
          img.onload = null;
          img.onerror = null;
          if (window.__RUEBENSH_FRAME_CACHE__) {
            window.__RUEBENSH_FRAME_CACHE__[url] = img;
          }
          loaded++;
          updateProgressUI(loaded, totalAssets);
          resolve();
        };

        img.onload = handleComplete;
        img.onerror = handleComplete; // Don't hang on network glitch
        img.src = url;
      }).then(() => loadNext());
    };

    // Launch parallel pool
    const poolSize = Math.min(CONCURRENCY, totalAssets);
    const workers = Array.from({ length: poolSize }, () => loadNext());

    Promise.all(workers).then(() => {
      finishPreloading();
    });

    // Safety timeout: max 25 seconds in case of extreme network delay
    const safetyTimeout = setTimeout(() => {
      finishPreloading();
    }, 25000);

    return () => {
      isMountedRef.current = false;
      clearTimeout(safetyTimeout);
    };
  }, []);

  if (isCompleted) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05, filter: "blur(12px)" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
                  className="stroke-accent fill-none transition-all duration-150 ease-out"
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
                <span className="text-[10px] text-accent/80 font-mono mt-0.5">
                  {loadedCount}/{totalCount}
                </span>
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
                  <span className="text-emerald-400 font-bold">ASOSIY SAHIFA TAYYOR!</span>
                </>
              )}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
