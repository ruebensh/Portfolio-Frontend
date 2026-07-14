import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Loader2, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface AdminLoginPageProps {
  onSuccess: () => void;
}

export function AdminLoginPage({ onSuccess }: AdminLoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animated canvas particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.4 + 0.1,
      alpha: Math.random() * 0.4 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y -= p.speed;
        p.pulse += 0.02;
        if (p.y < -5) {
          p.y = canvas.height + 5;
          p.x = Math.random() * canvas.width;
        }
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${a})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email va parolni to'ldiring.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        onSuccess();
      } else {
        setError("Email yoki parol noto'g'ri. Qayta urinib ko'ring.");
      }
    } catch {
      setError("Server bilan bog'lanishda xato yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#06050f]">
      {/* Animated Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Gradient Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-700/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-indigo-700/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Login Card */}
      <AnimatePresence>
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md mx-4"
          >
            {/* Card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.5)] overflow-hidden">

              {/* Top Gradient Line */}
              <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600" />

              <div className="p-8 sm:p-10">
                {/* Logo / Icon */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="flex flex-col items-center mb-8"
                >
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-violet-500/40 rounded-2xl blur-xl" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
                      <ShieldCheck size={30} className="text-white" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Admin Panel</h1>
                  <p className="text-sm text-slate-400 mt-1">Kirishingizni tasdiqlang</p>
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <Mail size={17} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        placeholder="admin@example.com"
                        autoComplete="email"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/60 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] transition-all"
                      />
                    </div>
                  </motion.div>

                  {/* Password */}
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Parol
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <Lock size={17} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-12 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/60 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm"
                      >
                        <AlertCircle size={16} className="shrink-0" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 rounded-2xl font-semibold text-white text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 disabled:opacity-60 disabled:pointer-events-none shadow-lg shadow-violet-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Tekshirilmoqda...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Kirish
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Footer note */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center text-xs text-slate-600 mt-6"
                >
                  Bu panel faqat sayt egasiga mo'ljallangan.
                </motion.p>
              </div>
            </div>

            {/* Bottom glow */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-violet-600/20 blur-2xl rounded-full pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
