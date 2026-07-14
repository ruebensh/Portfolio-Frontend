import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Linkedin,
  Github,
  Instagram,
  X,
  Clock,
  Wifi,
  WifiOff,
  Briefcase,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Platformalar konfiguratsiyasi
const PLATFORMS: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<any>;
    color: string;
    glow: string;
    bg: string;
    border: string;
  }
> = {
  telegram: {
    label: "Telegram",
    icon: Send,
    color: "text-sky-400",
    glow: "rgba(56, 189, 248, 0.4)",
    bg: "bg-sky-500/15",
    border: "border-sky-500/30",
  },
  linkedin: {
    label: "LinkedIn",
    icon: Linkedin,
    color: "text-blue-400",
    glow: "rgba(96, 165, 250, 0.4)",
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
  },
  github: {
    label: "GitHub",
    icon: Github,
    color: "text-slate-300",
    glow: "rgba(148, 163, 184, 0.35)",
    bg: "bg-slate-500/15",
    border: "border-slate-500/30",
  },
  instagram: {
    label: "Instagram",
    icon: Instagram,
    color: "text-pink-400",
    glow: "rgba(244, 114, 182, 0.4)",
    bg: "bg-pink-500/15",
    border: "border-pink-500/30",
  },
  busy: {
    label: "Band",
    icon: Briefcase,
    color: "text-amber-400",
    glow: "rgba(251, 191, 36, 0.4)",
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
  },
};

function getTimeSince(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Hozir";
  if (mins < 60) return `${mins} daq. avval`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} soat avval`;
  return `${Math.floor(hrs / 24)} kun avval`;
}

export function LiveStatusWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<string>("offline");
  const [links, setLinks] = useState<Record<string, string>>({});
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/settings`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data.onlineStatus || "offline");
          setUpdatedAt(data.onlineStatusUpdatedAt || null);
          setLinks({
            telegram: data.telegram || "",
            linkedin: data.linkedin || "",
            github: data.github || "",
            instagram: data.instagram || "",
          });
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Har 30 soniyada yangilab turadi
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = status !== "offline";
  const activePlatform = PLATFORMS[status] || null;

  const mainBtnGlow = isOnline && activePlatform
    ? activePlatform.glow
    : "rgba(100, 116, 139, 0.3)";

  if (loading) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="w-64 rounded-2xl border border-white/10 bg-black/70 backdrop-blur-2xl shadow-2xl overflow-hidden"
          >
            {/* Panel Top Gradient */}
            <div
              className="h-0.5 w-full"
              style={{
                background: isOnline && activePlatform
                  ? `radial-gradient(ellipse at 50%, ${activePlatform.glow} 0%, transparent 70%)`
                  : "rgba(100,116,139,0.4)",
              }}
            />

            <div className="p-4">
              {/* Status Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-slate-600"}`}
                    />
                    {isOnline && (
                      <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {isOnline
                      ? activePlatform?.label
                        ? `${activePlatform.label}da online`
                        : "Online"
                      : "Offline"}
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Active platform highlight */}
              {isOnline && activePlatform && status !== "busy" && (
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-3 border ${activePlatform.bg} ${activePlatform.border}`}
                >
                  <activePlatform.icon size={16} className={activePlatform.color} />
                  <div>
                    <div className="text-xs font-semibold text-white">
                      {activePlatform.label} orqali yozing
                    </div>
                    <div className="text-[10px] text-emerald-400">
                      Tez javob beraman ✦
                    </div>
                  </div>
                </div>
              )}

              {status === "busy" && (
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-3 border bg-amber-500/10 border-amber-500/25">
                  <Briefcase size={16} className="text-amber-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">Hozir bandman</div>
                    <div className="text-[10px] text-amber-300">Keyinroq yozing</div>
                  </div>
                </div>
              )}

              {/* Social Links */}
              <div className="space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2 px-1">
                  Ijtimoiy tarmoqlar
                </div>
                {(Object.keys(PLATFORMS) as string[])
                  .filter((p) => p !== "busy" && links[p])
                  .map((platform) => {
                    const cfg = PLATFORMS[platform];
                    const link = links[platform];
                    const isActive = status === platform;

                    return (
                      <a
                        key={platform}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all group ${
                          isActive
                            ? `${cfg.bg} ${cfg.border} border`
                            : "hover:bg-white/5"
                        }`}
                      >
                        <cfg.icon
                          size={15}
                          className={`${cfg.color} ${isActive ? "" : "opacity-60 group-hover:opacity-100"} transition-opacity`}
                        />
                        <span
                          className={`text-sm flex-1 ${
                            isActive ? "text-white font-medium" : "text-slate-400 group-hover:text-white"
                          } transition-colors`}
                        >
                          {cfg.label}
                        </span>
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </a>
                    );
                  })}
              </div>

              {/* Last updated */}
              {updatedAt && (
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5 text-[10px] text-slate-600">
                  <Clock size={10} />
                  Yangilangan: {getTimeSince(updatedAt)}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-center shadow-2xl overflow-visible"
        style={{ boxShadow: `0 0 24px ${mainBtnGlow}, 0 8px 32px rgba(0,0,0,0.4)` }}
        title={isOnline ? `Online - ${activePlatform?.label || ""}` : "Offline"}
      >
        {/* Online indicator dot */}
        <div className="absolute -top-1 -right-1 z-10">
          {isOnline ? (
            <div className="relative">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black" />
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
            </div>
          ) : (
            <div className="w-3.5 h-3.5 rounded-full bg-slate-600 border-2 border-black" />
          )}
        </div>

        {/* Icon */}
        {isOnline && activePlatform ? (
          <activePlatform.icon size={22} className={activePlatform.color} />
        ) : isOnline ? (
          <Wifi size={22} className="text-emerald-400" />
        ) : (
          <WifiOff size={22} className="text-slate-500" />
        )}
      </motion.button>
    </div>
  );
}
