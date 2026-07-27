import { useEffect, useRef, useState } from "react";

export function ParticleRevealOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const particleCount = 40000;
    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    };
    const particles: Particle[] = [];

    const colors = [
      "#ffffff",
      "#e0f2fe",
      "#bae6fd",
      "#818cf8",
      "#c084fc",
      "#a5b4fc",
      "#ffffff",
    ];

    const cx = width / 2;
    const cy = height / 2;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const startDist = Math.random() * (width * 0.7) + width * 0.3;

      const sx = cx + Math.cos(angle) * startDist;
      const sy = cy + Math.sin(angle) * (startDist * 0.6);

      const targetDist = Math.random() * (width * 0.15);
      const tx = cx + Math.cos(angle) * targetDist;
      const ty = cy + Math.sin(angle) * (targetDist * 0.6);

      const speed = Math.random() * 22 + 8;
      const moveAngle = Math.atan2(ty - sy, tx - sx);

      particles.push({
        x: sx,
        y: sy,
        vx: Math.cos(moveAngle) * speed,
        vy: Math.sin(moveAngle) * speed,
        size: Math.random() * 2.2 + 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.8 + 0.2,
      });
    }

    let animId: number;
    let frame = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      frame++;

      let activeCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0) continue;

        activeCount++;

        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.93;
        p.vy *= 0.93;

        p.alpha -= 0.016;

        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      if (activeCount > 0 && frame < 90) {
        animId = requestAnimationFrame(animate);
      } else {
        setVisible(false);
      }
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
    />
  );
}
