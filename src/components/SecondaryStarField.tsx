import { useEffect, useRef } from "react";
import { usePerformance } from "../context/PerformanceContext";

export function SecondaryStarField() {
  const { tier } = usePerformance();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    type Star = { x: number; y: number; z: number; r: number; p: number; tw: number };

    let targetStarCount = 120;
    if (tier === "best") targetStarCount = 600;
    else if (tier === "max") targetStarCount = 400;
    else if (tier === "ultra") targetStarCount = 250;
    else if (tier === "high") targetStarCount = 120;
    else if (tier === "medium") targetStarCount = 60;
    else if (tier === "low") targetStarCount = 25;

    const stars: Star[] = Array.from({ length: targetStarCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.pow(Math.random(), 1.7),
      r: 0.3 + Math.random() * 0.9,
      p: Math.random() * Math.PI * 2,
      tw: 0.3 + Math.random() * 0.8,
    }));

    if (tier === "low") {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      for (const st of stars) {
        ctx.beginPath();
        ctx.arc(st.x, st.y, Math.max(0.6, st.r * 0.8), 0, Math.PI * 2);
        ctx.fill();
      }
      return () => window.removeEventListener("resize", resize);
    }

    const drawStar = (x: number, y: number, r: number, a: number) => {
      if (tier === "medium" || tier === "high") {
        ctx.fillStyle = `rgba(255,255,255,${a * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.6, r), 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      const glowRadius = tier === "best" ? r * 8 : tier === "max" ? r * 6 : r * 4;
      const g = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(0.3, `rgba(255,255,255,${a * 0.25})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, a * 0.85)})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.55, r), 0, Math.PI * 2);
      ctx.fill();
    };

    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      for (const st of stars) {
        if (!prefersReduced) {
          st.y += (0.015 + st.z * 0.06) * 0.5;
          if (st.y > h + 20) st.y = -20;
        }

        const tw = prefersReduced ? 1 : 0.88 + 0.12 * Math.sin(t * 0.001 * st.tw + st.p);
        const alpha = Math.min(0.35, (0.10 + st.z * 0.25) * tw);
        const r = st.r * (0.7 + st.z * 0.8);

        drawStar(st.x, st.y, r, alpha);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [tier]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 -z-5 opacity-75 transition-opacity duration-500"
    />
  );
}