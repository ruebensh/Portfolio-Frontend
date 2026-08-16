import React, { createContext, useContext, useState, useEffect } from "react";

export type QualityTier = "max" | "ultra" | "high" | "medium" | "low";

interface PerformanceContextType {
  tier: QualityTier;
  setTier: (tier: QualityTier) => void;
  fps: number;
  isCpuRendering: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tier, setTierState] = useState<QualityTier>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portfolio_quality_tier") as QualityTier;
      if (saved && ["max", "ultra", "high", "medium", "low"].includes(saved)) {
        return saved;
      }
    }
    return "high"; // Default fallback while detecting
  });

  const [fps, setFps] = useState<number>(60);
  const [isCpuRendering, setIsCpuRendering] = useState<boolean>(false);

  const setTier = (newTier: QualityTier) => {
    setTierState(newTier);
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio_quality_tier", newTier);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if user already manually set a tier
    const saved = localStorage.getItem("portfolio_quality_tier");
    
    // 1. Hardware Detection
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // 2. WebGL Renderer Detection (Detect VirtualBox / SwiftShader / Software Renderer)
    let isSoftwareGpu = false;
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "";
          const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "";
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
      // Ignore WebGL check errors
    }

    // Determine initial tier based on hardware if not saved
    let initialTier: QualityTier = "high";
    if (isSoftwareGpu || cores <= 2 || memory <= 2) {
      initialTier = "low";
    } else if (isMobile || cores <= 4 || memory <= 4) {
      initialTier = "medium";
    } else if (cores >= 8 && memory >= 8) {
      initialTier = "ultra";
    } else {
      initialTier = "high";
    }

    if (!saved) {
      setTierState(initialTier);
    }

    // 3. Live FPS Benchmark Scaler (Monitor first 1.5 seconds)
    let frameCount = 0;
    let startTime = performance.now();
    let rafId = 0;

    const measureFps = (now: number) => {
      frameCount++;
      const elapsed = now - startTime;
      if (elapsed >= 1500) {
        const measuredFps = Math.round((frameCount * 1000) / elapsed);
        setFps(measuredFps);

        // Auto-scale tier if FPS is lagging and user didn't manually set preference
        if (!saved) {
          if (measuredFps < 32) {
            setTierState("low");
          } else if (measuredFps < 48 && (initialTier === "ultra" || initialTier === "high")) {
            setTierState("medium");
          }
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
