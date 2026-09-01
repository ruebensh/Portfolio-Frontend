"use client";

import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from "react";

export interface FrameSequenceCanvasRef {
  drawProgress: (progress: number) => void;
  drawFrameIndex: (index: number) => void;
  readonly isLoaded: boolean;
}

interface FrameSequenceCanvasProps {
  frameCount: number;
  framePath: (index: number) => string;
  onLoadProgress?: (progress: number) => void;
  onLoaded?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const FrameSequenceCanvas = forwardRef<
  FrameSequenceCanvasRef,
  FrameSequenceCanvasProps
>(({ frameCount, framePath, onLoadProgress, onLoaded, className = "", style }, ref) => {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const framesRef      = useRef<(HTMLImageElement | null)[]>([]);
  const currentIdxRef  = useRef(-1);
  const frameCountRef  = useRef(frameCount);
  const visibleRef     = useRef(true);
  const loadingRefs    = useRef<Set<number>>(new Set());
  const loadedCountRef = useRef(0);
  frameCountRef.current = frameCount;

  // Store callbacks in refs to avoid effect dependencies
  const onLoadProgressRef = useRef(onLoadProgress);
  const onLoadedRef       = useRef(onLoaded);
  const framePathRef      = useRef(framePath);
  onLoadProgressRef.current = onLoadProgress;
  onLoadedRef.current       = onLoaded;
  framePathRef.current      = framePath;

  const [loadedState, setLoadedState] = useState(false);
  const slowDeviceRef = useRef(false);

  const getFrameWindowSize = () => {
    if (typeof window === "undefined") return 5;
    const mobile = window.innerWidth <= 768;
    const slowCpu = typeof navigator !== "undefined" && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    return mobile || slowCpu ? 3 : 6;
  };

  const getNearestLoadedImage = (index: number) => {
    const total = frameCountRef.current;
    const maxRadius = total;

    for (let radius = 0; radius <= maxRadius; radius += 1) {
      const candidates = [index - radius, index + radius];
      for (const candidate of candidates) {
        if (candidate < 0 || candidate >= total) continue;
        const img = framesRef.current[candidate];
        if (img && img.complete && img.naturalWidth > 0) return img;
      }
    }

    return null;
  };

  // ── Stable draw helpers ────────────────────────────────────────────────────
  const drawFrameIndexFn = useRef((index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = framesRef.current[index] ?? getNearestLoadedImage(index);

    if (!canvas || !ctx || !img || !img.complete || img.naturalWidth === 0) return;
    if (!visibleRef.current) return;
    if (index === currentIdxRef.current) return;

    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;
    let drawW: number, drawH: number;

    if (canvasRatio > imgRatio) {
      drawW = cw;
      drawH = cw / imgRatio;
    } else {
      drawH = ch;
      drawW = ch * imgRatio;
    }

    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      drawW *= 1.15;
      drawH *= 1.15;
    }

    ctx.drawImage(img, (cw - drawW) / 2, (ch - drawH) / 2, drawW, drawH);
    currentIdxRef.current = index;
  });

  const resizeCanvasFn = useRef(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1, 1.25);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    const last = currentIdxRef.current;
    currentIdxRef.current = -1;
    if (last >= 0) drawFrameIndexFn.current(last);
  });

  const loadSingleFrame = useRef((idx: number) => {
    if (idx < 0 || idx >= frameCountRef.current) return;
    if (framesRef.current[idx] || loadingRefs.current.has(idx)) return;

    loadingRefs.current.add(idx);
    const img = new window.Image();
    img.decoding = "async";

    const timeoutId = window.setTimeout(() => {
      if (!img.complete) {
        img.src = "";
        loadingRefs.current.delete(idx);
        if (idx === currentIdxRef.current || Math.abs(idx - currentIdxRef.current) <= 1) {
          drawFrameIndexFn.current(currentIdxRef.current >= 0 ? currentIdxRef.current : 0);
        }
      }
    }, 4000);

    img.onload = () => {
      window.clearTimeout(timeoutId);
      framesRef.current[idx] = img;
      loadingRefs.current.delete(idx);
      loadedCountRef.current = framesRef.current.filter(Boolean).length;
      const progress = loadedCountRef.current / frameCountRef.current;
      onLoadProgressRef.current?.(progress);

      if (idx === currentIdxRef.current || Math.abs(idx - currentIdxRef.current) <= 1) {
        drawFrameIndexFn.current(idx);
      }

      if (loadedCountRef.current >= frameCountRef.current && !loadedState) {
        setLoadedState(true);
        onLoadedRef.current?.();
      }
    };

    img.onerror = () => {
      window.clearTimeout(timeoutId);
      loadingRefs.current.delete(idx);
      framesRef.current[idx] = null;
      loadedCountRef.current = framesRef.current.filter(Boolean).length;
      if (loadedCountRef.current >= frameCountRef.current && !loadedState) {
        setLoadedState(true);
        onLoadedRef.current?.();
      }
    };

    img.src = framePathRef.current(idx + 1);
  });

  const ensureFrameWindow = useRef((targetIndex: number) => {
    const total = frameCountRef.current;
    const windowSize = getFrameWindowSize();
    const start = Math.max(0, targetIndex - windowSize);
    const end = Math.min(total - 1, targetIndex + windowSize);
    const tailStart = Math.max(0, total - Math.max(12, Math.ceil(total * 0.18)));

    const delayedLoads: number[] = [];
    for (let i = start; i <= end; i += 1) {
      if (!framesRef.current[i] && !loadingRefs.current.has(i)) {
        delayedLoads.push(i);
      }
    }

    if (targetIndex >= tailStart || total <= 40) {
      for (let i = tailStart; i < total; i += 1) {
        if (!framesRef.current[i] && !loadingRefs.current.has(i)) {
          delayedLoads.push(i);
        }
      }
    }

    const uniqueLoads = [...new Set(delayedLoads)];
    uniqueLoads.forEach((index, offset) => {
      window.setTimeout(() => {
        loadSingleFrame.current(index);
      }, offset * 18);
    });
  });

  // ── Smart Frame Loader with narrow preloading window ───────────────────────
  useEffect(() => {
    let cancelled = false;
    const total = frameCount;
    const hasLowCoreCount = typeof navigator !== "undefined" && !!navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const isSlow = typeof window !== "undefined" && (window.innerWidth <= 768 || hasLowCoreCount);
    slowDeviceRef.current = Boolean(isSlow);

    framesRef.current = new Array(total).fill(null);
    currentIdxRef.current = -1;
    loadingRefs.current.clear();
    loadedCountRef.current = 0;
    setLoadedState(false);

    const initialWindow = slowDeviceRef.current ? 2 : 3;
    const tailWindow = Math.min(24, Math.max(12, Math.ceil(total * 0.2)));
    const initialLoads = Array.from(
      new Set([
        ...Array.from({ length: Math.min(initialWindow, total) }, (_, i) => i),
        ...Array.from({ length: tailWindow }, (_, i) => Math.max(0, total - tailWindow + i)),
      ])
    );

    initialLoads.forEach((index, offset) => {
      window.setTimeout(() => {
        if (!cancelled) {
          loadSingleFrame.current(index);
        }
      }, offset * 25);
    });

    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled) {
        setLoadedState(true);
        onLoadedRef.current?.();
      }
    }, slowDeviceRef.current ? 3500 : 5500);

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      loadingRefs.current.clear();
      for (let i = 0; i < total; i += 1) {
        const img = framesRef.current[i];
        if (img && !img.complete) {
          img.onload = null;
          img.onerror = null;
          img.src = "";
        }
      }
    };
  }, [frameCount]);

  // ── Canvas init / visibility ───────────────────────────────────────────────
  useEffect(() => {
    resizeCanvasFn.current();
    const onResize = () => resizeCanvasFn.current();
    const redrawWhenVisible = () => {
      const shouldBeVisible = !document.hidden;
      visibleRef.current = shouldBeVisible;
      if (!shouldBeVisible) return;

      if (currentIdxRef.current >= 0) {
        drawFrameIndexFn.current(currentIdxRef.current);
        return;
      }

      const fallbackIndex = Math.min(
        Math.max(0, frameCountRef.current - 1),
        Math.max(0, Math.round(frameCountRef.current * 0.1))
      );
      if (framesRef.current[fallbackIndex]) {
        drawFrameIndexFn.current(fallbackIndex);
      }
    };

    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", redrawWhenVisible);
    window.addEventListener("pageshow", redrawWhenVisible);

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      visibleRef.current = visible;
      if (visible) {
        redrawWhenVisible();
      }
    }, { threshold: 0.05 });

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", redrawWhenVisible);
      window.removeEventListener("pageshow", redrawWhenVisible);
      observer.disconnect();
    };
  }, []);

  // ── API ────────────────────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    drawFrameIndex: (index: number) => {
      if (!visibleRef.current) return;
      drawFrameIndexFn.current(index);
      ensureFrameWindow.current(index);
    },
    drawProgress: (progress: number) => {
      const clamped = Math.min(1, Math.max(0, progress));
      const idx = Math.min(
        frameCountRef.current - 1,
        Math.max(0, Math.round(clamped * (frameCountRef.current - 1)))
      );
      if (!visibleRef.current) return;
      drawFrameIndexFn.current(idx);
      ensureFrameWindow.current(idx);
    },
    get isLoaded() { return loadedState; },
  }), [loadedState]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ willChange: "contents", transform: "translateZ(0)", ...style }}
    />
  );
});

FrameSequenceCanvas.displayName = "FrameSequenceCanvas";
