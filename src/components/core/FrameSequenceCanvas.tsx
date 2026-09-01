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
  frameCountRef.current = frameCount;

  // Store callbacks in refs to avoid effect dependencies
  const onLoadProgressRef = useRef(onLoadProgress);
  const onLoadedRef       = useRef(onLoaded);
  const framePathRef      = useRef(framePath);
  onLoadProgressRef.current = onLoadProgress;
  onLoadedRef.current       = onLoaded;
  framePathRef.current      = framePath;

  const [loadedState, setLoadedState] = useState(false);

  // ── Stable draw helpers ────────────────────────────────────────────────────
  const drawFrameIndexFn = useRef((index: number) => {
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext("2d");
    const img    = framesRef.current[index];

    if (!canvas || !ctx || !img || !img.complete || img.naturalWidth === 0) return;
    if (index === currentIdxRef.current) return;

    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    const imgRatio    = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;
    let drawW: number, drawH: number;

    if (canvasRatio > imgRatio) {
      drawW = cw; drawH = cw / imgRatio;
    } else {
      drawH = ch; drawW = ch * imgRatio;
    }
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      drawW *= 1.2; drawH *= 1.2;
    }

    ctx.drawImage(img, (cw - drawW) / 2, (ch - drawH) / 2, drawW, drawH);
    currentIdxRef.current = index;
  });

  const resizeCanvasFn = useRef(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1, 1.5);
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    const last = currentIdxRef.current;
    currentIdxRef.current = -1;
    if (last >= 0) drawFrameIndexFn.current(last);
  });

  // ── Smart Frame Loader with Timeouts ───────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const total = frameCount;
    const imgs: (HTMLImageElement | null)[] = new Array(total).fill(null);
    framesRef.current = imgs;
    currentIdxRef.current = -1;
    setLoadedState(false);

    let completedCount = 0;
    let nextIndex = 0;
    const CONCURRENCY = 8; // High concurrency for fast parallel image preloading

    const onComplete = () => {
      completedCount++;
      const progress = completedCount / total;
      onLoadProgressRef.current?.(progress);

      if (completedCount === total && !cancelled) {
        setLoadedState(true);
        onLoadedRef.current?.();
      }
    };

    const loadNext = () => {
      if (cancelled) return;
      
      // If we loaded everything, we're done with this thread
      if (nextIndex >= total) return;
      
      const idx = nextIndex++;
      const img = new window.Image();
      
      // Safety timeout: if image hangs for 5s, mark it as failed and move on
      // This prevents the whole sequence from stalling if a request is dropped
      let timeoutId = setTimeout(() => {
        if (!cancelled && !img.complete) {
          img.src = ""; // Cancel load
          imgs[idx] = null; // Mark as failed
          onComplete();
          loadNext(); // Free up thread
        }
      }, 5000);

      const finish = () => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        onComplete();
        loadNext();
      };

      img.onload = () => {
        imgs[idx] = img;
        finish();
      };
      img.onerror = () => {
        imgs[idx] = null;
        finish();
      };

      img.src = framePathRef.current(idx + 1); // 1-indexed paths
    };

    // Kick off worker threads
    for (let i = 0; i < Math.min(CONCURRENCY, total); i++) {
      loadNext();
    }

    // Ultimate fallback: force resolve after 15s if things are completely stuck
    const ultimateTimer = setTimeout(() => {
      if (!cancelled && completedCount < total) {
        cancelled = true; // Stop worker threads
        setLoadedState(true);
        onLoadedRef.current?.();
      }
    }, 15_000);

    return () => {
      cancelled = true;
      clearTimeout(ultimateTimer);
      // Clean up in-flight requests
      for (let i = 0; i < total; i++) {
        const img = imgs[i];
        if (img && !img.complete) {
          img.onload = null;
          img.onerror = null;
          img.src = "";
        }
      }
    };
  }, [frameCount]); // Only run when frameCount changes, framePath is in a ref

  // ── Canvas init ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loadedState) return;
    resizeCanvasFn.current();
    drawFrameIndexFn.current(0);
    const onResize = () => resizeCanvasFn.current();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [loadedState]);

  // ── API ────────────────────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    drawFrameIndex: (index: number) => drawFrameIndexFn.current(index),
    drawProgress: (progress: number) => {
      const idx = Math.min(
        frameCountRef.current - 1,
        Math.max(0, Math.floor(progress * frameCountRef.current))
      );
      drawFrameIndexFn.current(idx);
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
