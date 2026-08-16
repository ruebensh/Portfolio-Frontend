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

  // Background Audio Controller for "Best" tier
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!audioRef.current) {
      const audio = new Audio("/background.mp3");
      audio.loop = true;
      audio.volume = 0.25; // Gentle soft background volume
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    const playAudio = () => {
      if (tier === "best") {
        audio
          .play()
          .then(() => setIsPlayingAudio(true))
          .catch(() => {
            // Autoplay blocked by browser policy — wait for user interaction
            setIsPlayingAudio(false);
          });
      } else {
        audio.pause();
        setIsPlayingAudio(false);
      }
    };

    playAudio();

    // Browser Autoplay Policy listener (plays audio on first user click if blocked initially)
    const handleUserInteraction = () => {
      if (tier === "best" && audio.paused) {
        audio.play().then(() => setIsPlayingAudio(true)).catch(() => {});
      }
    };

    window.addEventListener("click", handleUserInteraction, { once: false });
    window.addEventListener("keydown", handleUserInteraction, { once: false });

    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      if (tier !== "best") {
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
