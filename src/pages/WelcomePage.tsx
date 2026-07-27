import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, MousePointerClick, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WelcomePageProps {
  onEnter: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ─── Kosmik fon ───────────────────────────────────────────────────────────────

function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener("resize", resize);

    type Star = { x: number; y: number; r: number; speed: number; alpha: number };
    const stars: Star[] = Array.from({ length: 180 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      speed: Math.random() * 0.04 + 0.008,
      alpha: Math.random() * Math.PI * 2,
    }));

    const tick = () => {
      ctx.fillStyle = "rgba(2,2,2,0.18)";
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        s.y += s.speed;
        if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
        s.alpha += 0.018;
        const a = Math.sin(s.alpha) * 0.4 + 0.5;
        ctx.globalAlpha = a;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

// ─── Scratch Canvas ───────────────────────────────────────────────────────────

function ScratchLayer({
  onPercent,
  revealed,
}: {
  onPercent: (p: number) => void;
  revealed: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const initialized = useRef(false);

  const drawOverlay = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    // Gradient overlay
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#0f1120");
    grad.addColorStop(0.5, "#1a1f35");
    grad.addColorStop(1, "#0f1120");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 22) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 22) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Glow border
    ctx.strokeStyle = "rgba(99,102,241,0.25)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Text
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = `bold ${Math.max(12, w * 0.035)}px Inter, sans-serif`;
    ctx.fillText("Rasmni ochish uchun chizing ✦", w / 2, h / 2 - 10);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = `${Math.max(10, w * 0.025)}px Inter, sans-serif`;
    ctx.fillText("sichqoncha yoki barmog'ingiz bilan", w / 2, h / 2 + 16);
  }, []);

  // Canvas o'lchamini to'g'ri o'rnatish
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || initialized.current) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = rect.width;
    canvas.height = rect.height;
    drawOverlay(canvas);
    initialized.current = true;
  });

  const checkPercent = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cols = 20, rows = 12;
    let transparent = 0;
    const w = canvas.width, h = canvas.height;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const px = Math.floor((w / cols) * (c + 0.5));
        const py = Math.floor((h / rows) * (r + 0.5));
        const pixel = ctx.getImageData(px, py, 1, 1).data;
        if (pixel[3] < 10) transparent++;
      }
    }
    onPercent((transparent / (cols * rows)) * 100);
  }, [onPercent]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const scratchAt = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, Math.max(28, canvas.width * 0.06), 0, Math.PI * 2);
    ctx.fill();
    checkPercent();
  }, [checkPercent]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={(e) => { drawing.current = true; scratchAt(e); }}
      onMouseUp={() => { drawing.current = false; }}
      onMouseLeave={() => { drawing.current = false; }}
      onMouseMove={scratchAt}
      onTouchStart={(e) => { drawing.current = true; scratchAt(e); }}
      onTouchEnd={() => { drawing.current = false; }}
      onTouchMove={scratchAt}
      className="absolute inset-0 z-10 w-full h-full touch-none transition-opacity duration-700"
      style={{ opacity: revealed ? 0 : 1, pointerEvents: revealed ? "none" : "auto" }}
    />
  );
}

// ─── WelcomePage ──────────────────────────────────────────────────────────────

export function WelcomePage({ onEnter }: WelcomePageProps) {
  const [settings, setSettings] = useState<any>(null);
  const [scratchedPercent, setScratchedPercent] = useState(0);
  const [entering, setEntering] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  const avatarSrc = settings?.avatarUrl
    ? settings.avatarUrl.startsWith("http") ? settings.avatarUrl : `${API_URL}${settings.avatarUrl}`
    : "/avatar.jpg";

  const revealed = scratchedPercent >= 35;

  const handleEnter = useCallback(() => {
    if (entering) return;
    setEntering(true);
    setTimeout(() => setExpanded(true), 100);
    setTimeout(() => onEnter(), 1000);
  }, [entering, onEnter]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020202] select-none overflow-hidden">
      <CosmicBackground />

      {/* Expand overlay */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="fixed inset-0 z-[60] bg-[#020202]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeIn" }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-3xl px-4 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-md"
        >
          <Sparkles size={14} className="text-indigo-400" />
          <span className="text-xs font-medium text-indigo-300 tracking-wider uppercase">
            Welcome to my Space
          </span>
        </motion.div>

        {/* Sarlavha */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white"
        >
          {settings?.author || "Jaloliddin"} Portfoliosiga{" "}
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(90deg, #818cf8, #a78bfa, #f472b6)" }}
          >
            Xush Kelibsiz!
          </span>
        </motion.h1>

        {/* 16:9 Scratch karta */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={
            entering
              ? { scale: 22, opacity: 0, y: 0 }
              : { opacity: 1, scale: 1, y: 0 }
          }
          transition={
            entering
              ? { duration: 0.9, ease: [0.4, 0, 0.2, 1] }
              : { duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }
          }
          className="relative rounded-2xl overflow-hidden cursor-pointer shadow-2xl"
          style={{
            width: "min(640px, 90vw)",
            aspectRatio: "16/9",
            boxShadow: "0 0 0 1px rgba(99,102,241,0.15), 0 40px 80px rgba(0,0,0,0.7), 0 0 80px rgba(99,102,241,0.07)",
          }}
          onClick={revealed ? handleEnter : undefined}
          whileHover={revealed && !entering ? { scale: 1.02 } : {}}
        >
          {/* Avatar — orqa qatlam */}
          <img
            src={avatarSrc}
            alt="Profile"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-left pointer-events-none">
            <div className="text-white font-bold text-base sm:text-xl">
              {settings?.author || "Jaloliddin Xalimov"}
            </div>
            <div className="text-indigo-300 text-xs sm:text-sm mt-0.5">
              {settings?.title || "AI · ML Engineer · Startup Builder"}
            </div>
          </div>

          {/* Scratch layer */}
          <ScratchLayer onPercent={setScratchedPercent} revealed={revealed} />

          {/* Enter overlay — revealed bo'lganda */}
          <AnimatePresence>
            {revealed && !entering && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                style={{ background: "rgba(0,0,0,0.35)" }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center gap-2"
                >
                  <MousePointerClick size={28} className="text-white" />
                  <span className="text-white font-semibold text-sm tracking-wide">
                    Kirish uchun bosing
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="h-8 flex items-center justify-center"
        >
          {!revealed ? (
            <div className="flex items-center gap-2 text-xs text-white/30">
              <RefreshCw size={12} className="animate-spin text-indigo-400/60" />
              <span>
                Rasmni ochish uchun ustidan surting —{" "}
                <span className="text-indigo-400/70">
                  {Math.round(scratchedPercent)}% / 35%
                </span>
              </span>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-xs text-white/40"
            >
              <span>yoki</span>
              <button
                onClick={handleEnter}
                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
              >
                to'g'ridan kirish
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}