import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export type QualityTier = "best" | "max" | "ultra" | "high" | "medium" | "low";

interface PerformanceContextType {
  tier: QualityTier;
  setTier: (tier: QualityTier) => void;
  fps: number;
  isCpuRendering: boolean;
  isPlayingAudio: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

const SESSION_KEY = "portfolio_tier_session";
const VALID_TIERS: QualityTier[] = ["best", "max", "ultra", "high", "medium", "low"];

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tier, setTierState] = useState<QualityTier>(() => {
    if (typeof window !== "undefined") {
      const session = sessionStorage.getItem(SESSION_KEY) as QualityTier;
      if (session && VALID_TIERS.includes(session)) {
        return session;
      }
    }
    return "high";
  });

  const [fps, setFps] = useState<number>(60);
  const [isCpuRendering, setIsCpuRendering] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const setTier = (newTier: QualityTier) => {
    setTierState(newTier);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, newTier);
    }
  };

  // Background Audio Controller for Best, Max, and Ultra tiers
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!audioRef.current) {
      const audio = new Audio("/background.mp3");
      audio.loop = true;
      audio.preload = "auto";
      audioRef.current = audio;
    }

    const audio = audioRef.current;
    const MUSIC_TIERS: QualityTier[] = ["best", "max", "ultra"];
    const isMusicTier = MUSIC_TIERS.includes(tier);

    // Tier specific volumes (38% best, 33% max, 28% ultra)
    const volumeMap: Record<string, number> = {
      best: 0.38,
      max: 0.33,
      ultra: 0.28,
    };
    audio.volume = volumeMap[tier] || 0.28;

    const tryPlay = () => {
      if (isMusicTier) {
        audio
          .play()
          .then(() => setIsPlayingAudio(true))
          .catch(() => {
            setIsPlayingAudio(false);
          });
      } else {
        audio.pause();
        setIsPlayingAudio(false);
      }
    };

    tryPlay();

    // Catch any user gesture (click, tap, scroll, keypress) to unblock autoplay
    const handleGesture = () => {
      if (isMusicTier && audio.paused) {
        audio.play().then(() => setIsPlayingAudio(true)).catch(() => {});
      }
    };

    window.addEventListener("click", handleGesture, { passive: true });
    window.addEventListener("touchstart", handleGesture, { passive: true });
    window.addEventListener("pointerdown", handleGesture, { passive: true });
    window.addEventListener("keydown", handleGesture, { passive: true });

    return () => {
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
      window.removeEventListener("pointerdown", handleGesture);
      window.removeEventListener("keydown", handleGesture);
      if (!isMusicTier) {
        audio.pause();
      }
    };
  }, [tier]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sessionOverride = sessionStorage.getItem(SESSION_KEY);
    if (sessionOverride && VALID_TIERS.includes(sessionOverride as QualityTier)) {
      return;
    }

    // ── Fresh visit auto-detection ──
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    let isSoftwareGpu = false;
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "";
          const vendor  = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "";
          const lower = (renderer + " " + vendor).toLowerCase();
          if (
            lower.includes("swiftshader") ||
            lower.includes("llvmpipe") ||
            lower.includes("software") ||
            lower.includes("virtualbox") ||
            lower.includes("vmware") ||
            lower.includes("microsoft basic render")
          ) {
            isSoftwareGpu = true;
            setIsCpuRendering(true);
          }
        }
      }
    } catch (e) {
      // Ignore WebGL errors
    }

    let detectedTier: QualityTier;
    if (isSoftwareGpu || cores <= 2 || memory <= 2) {
      detectedTier = "low";
    } else if (isMobile && (cores <= 4 || memory <= 4)) {
      detectedTier = "medium";
    } else if (isMobile) {
      detectedTier = "high";
    } else if (cores >= 12 && memory >= 16) {
      detectedTier = "best";
    } else if (cores >= 8 && memory >= 8) {
      detectedTier = "ultra";
    } else {
      detectedTier = "high";
    }

    setTierState(detectedTier);

    let frameCount = 0;
    let rafId = 0;
    const startTime = performance.now();

    const measureFps = (now: number) => {
      frameCount++;
      const elapsed = now - startTime;
      if (elapsed >= 1500) {
        const measuredFps = Math.round((frameCount * 1000) / elapsed);
        setFps(measuredFps);

        if (measuredFps < 32) {
          setTierState("low");
        } else if (measuredFps < 48 && (detectedTier === "best" || detectedTier === "ultra" || detectedTier === "high")) {
          setTierState("medium");
        }
        return;
      }
      rafId = requestAnimationFrame(measureFps);
    };

    rafId = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <PerformanceContext.Provider value={{ tier, setTier, fps, isCpuRendering, isPlayingAudio }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = (): PerformanceContextType => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error("usePerformance must be used within a PerformanceProvider");
  }
  return context;
};
