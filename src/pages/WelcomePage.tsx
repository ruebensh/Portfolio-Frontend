import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface WelcomePageProps {
  onEnter: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ─── Nebula Background ────────────────────────────────────────────────────────

function NebulaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0, w = 0, h = 0;
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * DPR; canvas.height = h * DPR;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Yulduzlar — 3 qatlam (chuqurlik)
    type Star = { x: number; y: number; z: number; r: number; a: number; da: number; vy: number };
    const layers: Star[][] = [[], [], []];
    const counts = [300, 150, 60];
    const speeds = [0.06, 0.14, 0.28];
    const sizes  = [0.4, 0.8, 1.4];

    layers.forEach((layer, li) => {
      for (let i = 0; i < counts[li]; i++) {
        layer.push({
          x: Math.random() * w, y: Math.random() * h,
          z: li, r: sizes[li] * (0.6 + Math.random() * 0.8),
          a: Math.random() * Math.PI * 2, da: 0.003 + Math.random() * 0.008,
          vy: speeds[li] * (0.5 + Math.random() * 0.5),
        });
      }
    });

    // Meteor
    type Meteor = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; trail: number };
    const meteors: Meteor[] = [];
    const spawnMeteor = () => {
      if (Math.random() > 0.015) return;
      const angle = Math.PI * 1.2 + (Math.random() - 0.5) * 0.3;
      const speed = 12 + Math.random() * 8;
      meteors.push({
        x: Math.random() * w * 0.8 + w * 0.1,
        y: Math.random() * h * 0.3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0, maxLife: 30 + Math.random() * 25,
        trail: 120 + Math.random() * 120,
      });
      if (meteors.length > 5) meteors.shift();
    };

    const onMove = (e: PointerEvent) => {
      mouseRef.current.tx = e.clientX / w;
      mouseRef.current.ty = e.clientY / h;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      // Nebula glow — mouse parallax
      const m = mouseRef.current;
      m.x += (m.tx - m.x) * 0.04;
      m.y += (m.ty - m.y) * 0.04;

      // Deep space gradient
      const bg = ctx.createRadialGradient(
        w * m.x, h * m.y, 0,
        w * 0.5, h * 0.5, Math.max(w, h) * 0.9
      );
      bg.addColorStop(0, "rgba(15,10,35,1)");
      bg.addColorStop(0.4, "rgba(6,4,20,1)");
      bg.addColorStop(1, "rgba(2,2,8,1)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Nebula clouds
      const nebulaPoints = [
        { cx: w * 0.2, cy: h * 0.3, rx: w * 0.35, ry: h * 0.4, c: "rgba(60,30,120,0.06)" },
        { cx: w * 0.8, cy: h * 0.6, rx: w * 0.3,  ry: h * 0.35, c: "rgba(20,60,120,0.05)" },
        { cx: w * 0.5, cy: h * 0.8, rx: w * 0.4,  ry: h * 0.3,  c: "rgba(80,20,80,0.04)"  },
      ];
      for (const nb of nebulaPoints) {
        const g = ctx.createRadialGradient(nb.cx + m.x * 30, nb.cy + m.y * 20, 0, nb.cx, nb.cy, Math.max(nb.rx, nb.ry));
        g.addColorStop(0, nb.c);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // Yulduzlar
      for (const layer of layers) {
        for (const s of layer) {
          s.a += s.da;
          s.y += s.vy;
          if (s.y > h + 4) { s.y = -4; s.x = Math.random() * w; }

          const px = s.x + (m.x - 0.5) * s.z * 18;
          const py = s.y + (m.y - 0.5) * s.z * 12;
          const alpha = (0.3 + Math.sin(s.a) * 0.25) * (0.4 + s.z * 0.3);

          // Glow
          const glow = ctx.createRadialGradient(px, py, 0, px, py, s.r * 5);
          glow.addColorStop(0, `rgba(255,255,255,${alpha * 0.6})`);
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.beginPath(); ctx.arc(px, py, s.r * 5, 0, Math.PI * 2); ctx.fill();

          ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha * 1.2)})`;
          ctx.beginPath(); ctx.arc(px, py, Math.max(0.4, s.r), 0, Math.PI * 2); ctx.fill();

          // Cross flicker for bright stars
          if (s.z === 2 && Math.sin(s.a) > 0.7) {
            ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.4})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(px - 7, py); ctx.lineTo(px + 7, py); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(px, py - 7); ctx.lineTo(px, py + 7); ctx.stroke();
          }
        }
      }

      // Meteorlar
      spawnMeteor();
      ctx.globalCompositeOperation = "lighter";
      for (let i = meteors.length - 1; i >= 0; i--) {
        const mt = meteors[i];
        mt.life++; mt.x += mt.vx; mt.y += mt.vy;
        const k = 1 - mt.life / mt.maxLife;
        const appear = Math.min(1, mt.life / 8);
        const a = Math.max(0, k * 0.5) * appear;
        const tx = mt.x - mt.vx * (mt.trail / 10);
        const ty = mt.y - mt.vy * (mt.trail / 10);
        const grad = ctx.createLinearGradient(mt.x, mt.y, tx, ty);
        grad.addColorStop(0, `rgba(200,210,255,${a})`);
        grad.addColorStop(0.3, `rgba(180,200,255,${a * 0.4})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad; ctx.lineWidth = 1.5 + k;
        ctx.beginPath(); ctx.moveTo(mt.x, mt.y); ctx.lineTo(tx, ty); ctx.stroke();
        if (mt.life > mt.maxLife || mt.x < -400 || mt.y > h + 300) meteors.splice(i, 1);
      }
      ctx.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

// ─── Spotlight Reveal ─────────────────────────────────────────────────────────

function SpotlightReveal({
  avatarSrc,
  cardRef,
}: {
  avatarSrc: string;
  cardRef: React.RefObject<HTMLDivElement>;
}) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [inside, setInside] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setPos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      });
    };

    const onEnter = () => setInside(true);
    const onLeave = () => setInside(false);

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseenter", onEnter);
    card.addEventListener("mouseleave", onLeave);

    return () => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseenter", onEnter);
      card.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [cardRef]);

  return (
    <div
      className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none transition-opacity duration-500"
      style={{ opacity: inside ? 1 : 0 }}
    >
      <img
        src={avatarSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.9) saturate(1.15)" }}
      />
      {/* Mask — faqat kursor atrofida ko'rinadigan */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle 140px at ${pos.x}% ${pos.y}%, transparent 0%, rgba(5,3,15,0.97) 100%)`,
          transition: "background 0.01s linear",
        }}
      />
    </div>
  );
}

// ─── WelcomePage ──────────────────────────────────────────────────────────────

export function WelcomePage({ onEnter }: WelcomePageProps) {
  const [settings, setSettings] = useState<any>(null);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  const avatarSrc = settings?.avatarUrl
    ? settings.avatarUrl.startsWith("http") ? settings.avatarUrl : `${API_URL}${settings.avatarUrl}`
    : "/avatar.jpg";

  // 3D tilt
  const cardRef = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const springX = useSpring(rotX, { stiffness: 200, damping: 28 });
  const springY = useSpring(rotY, { stiffness: 200, damping: 28 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el || entering) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotX.set(-y * 14);
    rotY.set(x * 14);
  }, [rotX, rotY, entering]);

  const handleMouseLeave = useCallback(() => {
    rotX.set(0);
    rotY.set(0);
  }, [rotX, rotY]);

  // Spin + expand
  const handleClick = useCallback(() => {
    if (entering) return;
    setEntering(true);
    setTimeout(() => onEnter(), 1100);
  }, [entering, onEnter]);

  // Shimmer position
  const shimmerX = useTransform(springY, [-7, 7], ["-40%", "140%"]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#02020a]">
      <NebulaBackground />

      {/* Expand overlay */}
      {entering && (
        <motion.div
          className="fixed inset-0 z-[60] bg-[#020202]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.5, ease: "easeIn" }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-8">

        {/* 16:9 Glassmorphism 3D karta */}
        <motion.div
          initial={{ opacity: 0, scale: 0.82, y: 32 }}
          animate={
            entering
              ? { rotateY: 720, scale: 26, opacity: 0 }
              : { opacity: 1, scale: 1, y: 0 }
          }
          transition={
            entering
              ? { duration: 1.0, ease: [0.4, 0, 0.2, 1] }
              : { duration: 1.0, ease: [0.22, 1, 0.36, 1] }
          }
          style={{
            rotateX: entering ? 0 : springX,
            rotateY: entering ? undefined : springY,
            transformStyle: "preserve-3d",
            perspective: 900,
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          className="cursor-pointer"
        >
          <div
            ref={cardRef}
            className="relative rounded-2xl overflow-hidden"
            style={{
              width: "min(480px, 88vw)",
              aspectRatio: "16/9",
              background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.05) 100%)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: `
                0 0 0 1px rgba(120,100,255,0.12),
                0 30px 70px rgba(0,0,0,0.8),
                0 0 80px rgba(80,60,200,0.08),
                inset 0 1px 0 rgba(255,255,255,0.08)
              `,
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Spotlight avatar reveal */}
            <SpotlightReveal avatarSrc={avatarSrc} cardRef={cardRef as React.RefObject<HTMLDivElement>} />

            {/* Glass grid */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            {/* Shimmer highlight — tilt bilan harakat qiladi */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)",
                x: shimmerX,
              }}
            />

            {/* Corner accents */}
            {[
              "top-0 left-0",
              "top-0 right-0 rotate-90",
              "bottom-0 left-0 -rotate-90",
              "bottom-0 right-0 rotate-180",
            ].map((pos, i) => (
              <div key={i} className={`absolute ${pos} w-5 h-5 pointer-events-none`}>
                <div className="absolute top-2 left-2 w-3 h-px bg-white/20" />
                <div className="absolute top-2 left-2 w-px h-3 bg-white/20" />
              </div>
            ))}

            {/* Mazmun */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                className="w-12 h-12 rounded-full overflow-hidden border border-white/15 shadow-xl"
                style={{ boxShadow: "0 0 20px rgba(120,100,255,0.3)" }}
              >
                <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.6 }}
                className="text-center"
              >
                <div
                  className="text-white/90 font-semibold text-sm sm:text-base tracking-wide"
                  style={{ textShadow: "0 0 24px rgba(255,255,255,0.15)" }}
                >
                  {settings?.author || "Jaloliddin Xalimov"}
                </div>
                <div className="text-white/30 text-[10px] sm:text-xs mt-0.5 tracking-widest uppercase">
                  AI · ML · Builder
                </div>
              </motion.div>

              {/* Pulse dot */}
              <motion.div
                className="flex items-center gap-1.5 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                  animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="text-[9px] text-white/25 tracking-widest uppercase">
                  bosib kirish
                </span>
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                  animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Hint matn */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-white/20 text-[11px] tracking-widest uppercase"
        >
          kursor olib keling · bosib kiring
        </motion.p>
      </div>
    </div>
  );
}