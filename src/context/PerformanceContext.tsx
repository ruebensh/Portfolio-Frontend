import React, { createContext, useContext, useState, useEffect } from "react";

export type QualityTier = "max" | "ultra" | "high" | "medium" | "low";

interface PerformanceContextType {
  tier: QualityTier;
  setTier: (tier: QualityTier) => void;
  fps: number;
  isCpuRendering: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

// Session key: survives page reload (within same tab) but NOT a fresh visit / new tab
const SESSION_KEY = "portfolio_tier_session";
const VALID_TIERS: QualityTier[] = ["max", "ultra", "high", "medium", "low"];

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tier, setTierState] = useState<QualityTier>(() => {
    if (typeof window !== "undefined") {
      // sessionStorage survives a manual reload (triggered by tier button)
      // but NOT a fresh browser tab or new navigation — perfect for auto-detect UX
      const session = sessionStorage.getItem(SESSION_KEY) as QualityTier;
      if (session && VALID_TIERS.includes(session)) {
        return session;
      }
    }
    return "high"; // Default while hardware detection runs
  });

  const [fps, setFps] = useState<number>(60);
  const [isCpuRendering, setIsCpuRendering] = useState<boolean>(false);

  // setTier: update state + save to sessionStorage (survives reload, not new visit)
  const setTier = (newTier: QualityTier) => {
    setTierState(newTier);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, newTier);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // If a session override exists (user clicked button → reload), respect it — skip detection
    const sessionOverride = sessionStorage.getItem(SESSION_KEY);
    if (sessionOverride && VALID_TIERS.includes(sessionOverride as QualityTier)) {
      // Clear the session override so NEXT fresh visit auto-detects again
      // But keep it for this load (state already set in useState above)
      return;
    }

    // ── Fresh visit: always auto-detect ──────────────────────────────────────

    // 1. Hardware Detection
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // 2. WebGL GPU Detection (VirtualBox / SwiftShader / Software Renderer)
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

    // 3. Determine initial tier based on hardware
    let detectedTier: QualityTier;
    if (isSoftwareGpu || cores <= 2 || memory <= 2) {
      detectedTier = "low";
    } else if (isMobile && (cores <= 4 || memory <= 4)) {
      detectedTier = "medium";
    } else if (isMobile) {
      detectedTier = "high";
    } else if (cores >= 8 && memory >= 8) {
      detectedTier = "ultra";
    } else {
      detectedTier = "high";
    }

    setTierState(detectedTier);

    // 4. Live FPS Benchmark (first 1.5 seconds) — may downgrade tier further
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
        } else if (measuredFps < 48 && (detectedTier === "ultra" || detectedTier === "high")) {
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
    <PerformanceContext.Provider value={{ tier, setTier, fps, isCpuRendering }}>
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
