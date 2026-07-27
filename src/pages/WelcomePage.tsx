import { useState, useEffect, useRef } from "react";
import { Sparkles, MousePointerClick, RefreshCw } from "lucide-react";

interface WelcomePageProps {
  onEnter: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function WelcomePage({ onEnter }: WelcomePageProps) {
  const [settings, setSettings] = useState<any>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [scratchedPercent, setScratchedPercent] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scratchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);

  // Fetch settings for avatarUrl
  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
      })
      .catch((err) => console.error("Xato settings yuklashda:", err));
  }, []);

  const avatarSrc = settings?.avatarUrl
    ? (settings.avatarUrl.startsWith("http") ? settings.avatarUrl : `${API_URL}${settings.avatarUrl}`)
    : "/placeholder-avatar.jpg"; // fallback

  // 1. Cosmic background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const stars: { x: number; y: number; r: number; speed: number; alpha: number }[] = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.05 + 0.01,
        alpha: Math.random(),
      });
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.fillStyle = "rgba(2, 2, 2, 0.2)";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "#ffffff";
      stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > h) {
          star.y = 0;
          star.x = Math.random() * w;
        }
        ctx.globalAlpha = Math.sin(star.alpha) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
        star.alpha += 0.02;
      });
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 2. Setup the scratch canvas with ResizeObserver for robust sizing
  useEffect(() => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Use contentRect or fallback to offsetWidth/offsetHeight
        const width = entry.contentRect.width || canvas.offsetWidth || 320;
        const height = entry.contentRect.height || canvas.offsetHeight || 180;
        
        if (width > 0 && height > 0) {
          canvas.width = width;
          canvas.height = height;
          drawOverlay(ctx, width, height);
          checkScratchPercentage(); // Initial check
        }
      }
    });

    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, [settings]);

  const drawOverlay = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Premium dark gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, "#111827");
    gradient.addColorStop(0.5, "#1f2937");
    gradient.addColorStop(1, "#111827");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Subtle grid/stars on the card overlay
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();
    }
    for (let j = 0; j < h; j += 20) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(w, j);
      ctx.stroke();
    }

    // Glowing border inside card
    ctx.strokeStyle = "rgba(99, 102, 241, 0.2)";
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Instructions
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "bold 16px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Rasmni ochish uchun chizing 🧑‍💻", w / 2, h / 2 - 10);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText("(Kursor yoki barmog'ingiz bilan surting)", w / 2, h / 2 + 15);
  };

  const getCoordinates = (e: any) => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Check if touch event
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: any) => {
    isDrawingRef.current = true;
    scratch(e);
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const scratch = (e: any) => {
    if (!isDrawingRef.current) return;
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 32, 0, Math.PI * 2);
    ctx.fill();

    checkScratchPercentage();
  };

  const checkScratchPercentage = () => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Sample pixels in a grid
    const cols = 20;
    const rows = 12;
    let transparentCount = 0;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const px = Math.floor((width / cols) * (c + 0.5));
        const py = Math.floor((height / rows) * (r + 0.5));
        const pixel = ctx.getImageData(px, py, 1, 1).data;
        if (pixel[3] < 10) { // Alpha is transparent
          transparentCount++;
        }
      }
    }

    const percent = (transparentCount / (cols * rows)) * 100;
    setScratchedPercent(percent);
  };

  const handleCardClick = () => {
    if (isEntering) return;
    setIsEntering(true);
    
    // Wait for the spin & expand transition to finish
    setTimeout(() => {
      onEnter();
    }, 1200);
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020202] select-none overflow-hidden transition-all duration-1000 ${
        isEntering ? "opacity-100 scale-100" : ""
      }`}
    >
      {/* Space Backdrop */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Main card & UI */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-4xl px-4 text-center">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md animate-pulse">
          <Sparkles size={16} className="text-primary animate-spin" />
          <span className="text-sm font-medium text-primary-foreground">Welcome to my Space</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          {settings?.author || "Jaloliddin"} Portfoliosiga <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Xush Kelibsiz!
          </span>
        </h1>

        {/* 16:9 Card */}
        <div
          ref={cardRef}
          onClick={handleCardClick}
          className={`relative w-[320px] h-[180px] sm:w-[480px] sm:h-[270px] md:w-[640px] md:h-[360px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 cursor-pointer transition-all duration-[1200ms] ease-in-out ${
            isEntering
              ? "rotate-[1080deg] scale-[50] pointer-events-none z-50 bg-[#020202]"
              : "hover:scale-105 hover:border-primary/50 shadow-indigo-500/10"
          }`}
        >
          {/* Card background/content to be revealed */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 to-purple-950/90 flex items-center justify-center">
            {avatarSrc && (
              <img
                src={avatarSrc}
                alt="Profile"
                onLoad={() => setImageLoaded(true)}
                className="w-full h-full object-cover opacity-80"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-left">
              <h2 className="text-lg sm:text-2xl font-bold text-white mb-1">
                {settings?.author || "Jaloliddin"}
              </h2>
              <p className="text-xs sm:text-sm text-indigo-300">
                {settings?.description || "Software Engineer"}
              </p>
            </div>
            
            {/* Dark overlay that fades in during full entry so it transition into dark page */}
            <div className={`absolute inset-0 bg-[#020202] transition-opacity duration-1000 pointer-events-none ${
              isEntering ? "opacity-100" : "opacity-0"
            }`} />
          </div>

          {/* Scratch layer */}
          <canvas
            ref={scratchCanvasRef}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onMouseMove={scratch}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={scratch}
            className={`absolute inset-0 z-10 w-full h-full transition-opacity duration-500 ${
              scratchedPercent > 35 ? "opacity-0 pointer-events-none" : ""
            }`}
          />
        </div>

        {/* Dynamic Help/Enter Message */}
        <div className="h-12 flex items-center justify-center">
          {scratchedPercent > 35 ? (
            <button
              onClick={handleCardClick}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition-all hover:scale-105 active:scale-95 animate-bounce"
            >
              <MousePointerClick size={18} /> Kirish / Enter
            </button>
          ) : (
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin text-indigo-400" />
              Rasmni ochish uchun sichqoncha bilan ustidan surting (kamida 35%)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
