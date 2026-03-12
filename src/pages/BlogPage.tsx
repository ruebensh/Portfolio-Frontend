import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Play,
  ChevronDown,
  Loader2,
  ArrowDown,
  Pause,
  Trash2,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "";

type TgEntity = {
  type: string;
  offset: number;
  length: number;
  url?: string;
};

type LinkPreview = {
  url: string;
  title?: string;
  description?: string;
  photo?: string;
  site_name?: string;
  display_url?: string;
};

type TelegramEmbed = {
  channelUsername: string;
  messageId: string;
  originalUrl: string;
};

type Reaction = { emoji: string; label: string; count: number; reacted: boolean };
type Comment = {
  id: string;
  author: string;
  text: string;
  created_at: string;
  from_telegram: number;
};

type Post = {
  id: string;
  text: string;
  date: string;
  views: number;
  mediaType: "none" | "image" | "video" | "gif" | "audio" | "voice" | "sticker" | "document";
  imageUrl?: string;
  videoUrl?: string;
  stickerUrl?: string;
  stickerEmoji?: string;
  audioUrl?: string;
  audioTitle?: string;
  audioPerformer?: string;
  docUrl?: string;
  docName?: string;
  docMime?: string;
  channelUsername?: string;
  entities?: TgEntity[];
  linkPreview?: LinkPreview | null;
  telegramEmbed?: TelegramEmbed | null;
  reactions: Reaction[];
  comments: Comment[];
  commentsCount?: number;
};

const DEFAULT_REACTIONS = [
  { emoji: "🔥", label: "fire" },
  { emoji: "👍", label: "like" },
  { emoji: "❤️", label: "heart" },
  { emoji: "🤯", label: "mind-blown" },
];

function PageBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const scrollRef = useRef({ y: 0, ty: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

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

    type Star = { x: number; y: number; z: number; r: number; tw: number; p: number };
    type Meteor = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      w: number;
      z: number;
      r: number;
      hue: number;
      fadeIn: number;
    };

    const starCount = Math.floor(Math.min(700, Math.max(320, (w * h) / 2200)));
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.pow(Math.random(), 1.9),
      r: 0.28 + Math.random() * 1.05,
      tw: 0.25 + Math.random() * 0.95,
      p: Math.random() * Math.PI * 2,
    }));
    const meteors: Meteor[] = [];

    const spawnMeteor = () => {
      if (prefersReduced || Math.random() > 0.028) return;
      const z = Math.random() < 0.15 ? 0.75 + Math.random() * 0.25 : Math.pow(Math.random(), 2.2);
      const angle = (Math.PI * 7) / 6 + (Math.random() - 0.5) * (0.22 + (1 - z) * 0.18);
      const speed = (10 + Math.random() * 6) * (0.65 + z * 1.25);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const entryX = Math.random() * w * 0.9 + w * 0.05;
      const entryY = Math.random() * h * 0.3 + h * 0.02;
      const margin = 220 + z * 220;
      meteors.push({
        x: entryX - vx * (margin / 10),
        y: entryY - vy * (margin / 10),
        vx,
        vy,
        life: 0,
        maxLife: (38 + Math.random() * 38) * (0.7 + z * 0.85),
        w: (210 + Math.random() * 260) * (0.55 + z * 1.15),
        z,
        r: (0.9 + Math.random() * 1.5) * (0.55 + z * 1.35),
        hue: 200 + Math.random() * 40,
        fadeIn: Math.floor(6 + Math.random() * 10 + z * 6),
      });
      if (meteors.length > 8) meteors.shift();
    };

    const drawGlowStar = (x: number, y: number, radius: number, alpha: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius * 6);
      g.addColorStop(0, `rgba(255,255,255,${alpha})`);
      g.addColorStop(0.25, `rgba(255,255,255,${alpha * 0.3})`);
      g.addColorStop(1, `rgba(255,255,255,0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, radius * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha * 1.05)})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.55, radius), 0, Math.PI * 2);
      ctx.fill();
    };

    const onMove = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth - 0.5;
      mouseRef.current.y = e.clientY / window.innerHeight - 0.5;
    };
    const onScroll = () => {
      scrollRef.current.y = window.scrollY || 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      const m = mouseRef.current;
      m.tx += (m.x - m.tx) * 0.06;
      m.ty += (m.y - m.ty) * 0.06;

      const s = scrollRef.current;
      s.ty += (s.y - s.ty) * 0.14;
      const parallax = s.ty * 0.2;

      const bg = ctx.createRadialGradient(
        w * 0.5 + m.tx * 60,
        h * 0.35 + m.ty * 40,
        Math.min(w, h) * 0.12,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.95,
      );
      bg.addColorStop(0, "rgba(255,255,255,0.010)");
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      for (const st of stars) {
        if (!prefersReduced) {
          st.y += (0.02 + st.z * 0.12) * 0.6 * 1.85;
          if (st.y > h + 40) st.y = -40;
        }
        const depth = 0.22 + st.z * 0.85;
        const twinkle = prefersReduced ? 1 : 0.8 + 0.2 * Math.sin(t * 0.0011 * st.tw + st.p);
        const alpha = Math.min(0.7, depth * 0.55 * twinkle);
        const radius = st.r * (0.75 + st.z * 1.0);
        const px = st.x + m.tx * (st.z - 0.2) * 14;
        const py = st.y + m.ty * (st.z - 0.2) * 12 - parallax * (0.35 + st.z * 1.35);
        drawGlowStar(px, py, radius, alpha);
        if (st.z > 0.84 && twinkle > 0.94) {
          ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px - 6, py);
          ctx.lineTo(px + 6, py);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(px, py - 6);
          ctx.lineTo(px, py + 6);
          ctx.stroke();
        }
      }

      if (!prefersReduced) spawnMeteor();
      ctx.globalCompositeOperation = "lighter";

      for (let i = meteors.length - 1; i >= 0; i -= 1) {
        const mt = meteors[i];
        mt.life += 1;
        mt.x += mt.vx;
        mt.y += mt.vy;
        const k = 1 - mt.life / mt.maxLife;
        const appear = Math.min(1, mt.life / mt.fadeIn);
        const a = Math.max(0, Math.min(0.42, k * (0.1 + mt.z * 0.3))) * appear;
        const tx = mt.x - mt.vx * (mt.w / 12) * (0.15 + 0.85 * appear);
        const ty = mt.y - mt.vy * (mt.w / 12) * (0.15 + 0.85 * appear);
        const grad = ctx.createLinearGradient(mt.x, mt.y, tx, ty);
        grad.addColorStop(0, `hsla(${mt.hue}, 95%, 92%, ${a})`);
        grad.addColorStop(0.25, `hsla(${mt.hue}, 90%, 85%, ${a * 0.55})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = (1.0 + mt.z * 2.2) * (0.85 + 0.15 * appear);
        ctx.beginPath();
        ctx.moveTo(mt.x, mt.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        drawGlowStar(mt.x, mt.y, mt.r, a * (1.2 + mt.z));
        if (mt.life > mt.maxLife || mt.x < -500 || mt.y > h + 500 || mt.x > w + 500 || mt.y < -500) {
          meteors.splice(i, 1);
        }
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 blog-aurora" />
      <div className="absolute inset-0 page-grid" />
      <div className="absolute inset-0 page-vignette" />
      <canvas ref={canvasRef} className="absolute inset-0 opacity-70" />
    </div>
  );
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "Hozirgina";
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  if (diff < 172800) return "Kecha";
  return d.toLocaleDateString("uz-UZ");
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}

function normalizeHref(href: string) {
  if (/^https?:\/\//i.test(href)) return href;
  return `https://${href}`;
}

function renderPlain(text: string) {
  return text.split("\n").map((line, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {line}
    </span>
  ));
}

function PostText({ text, entities }: { text: string; entities?: TgEntity[] }) {
  if (!text) return null;

  if (!entities || entities.length === 0) {
    return <p className="text-[14px] text-white/90 leading-relaxed mb-4 whitespace-pre-wrap break-words">{text}</p>;
  }

  const chars = Array.from(text);
  const sorted = [...entities].sort((a, b) => a.offset - b.offset);
  const result: React.ReactNode[] = [];
  let cursor = 0;

  for (const entity of sorted) {
    if (entity.offset < cursor) continue;

    if (entity.offset > cursor) {
      const plain = chars.slice(cursor, entity.offset).join("");
      result.push(<span key={`plain-${cursor}`}>{renderPlain(plain)}</span>);
    }

    const entityText = chars.slice(entity.offset, entity.offset + entity.length).join("");
    const key = `entity-${entity.offset}-${entity.type}`;

    switch (entity.type) {
      case "url": {
        const href = normalizeHref(entityText);
        result.push(
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 break-all transition-colors"
          >
            {entityText}
          </a>,
        );
        break;
      }
      case "text_link":
        result.push(
          <a
            key={key}
            href={entity.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 break-all transition-colors"
          >
            {entityText}
          </a>,
        );
        break;
      case "bold":
        result.push(
          <strong key={key} className="text-white font-semibold">
            {entityText}
          </strong>,
        );
        break;
      case "italic":
        result.push(
          <em key={key} className="text-white/80 italic">
            {entityText}
          </em>,
        );
        break;
      case "code":
        result.push(
          <code
            key={key}
            className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[12px] font-mono text-green-300"
          >
            {entityText}
          </code>,
        );
        break;
      case "pre":
        result.push(
          <pre
            key={key}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-[12px] font-mono text-green-300 overflow-x-auto my-1 whitespace-pre-wrap"
          >
            {entityText}
          </pre>,
        );
        break;
      case "mention":
        result.push(
          <a
            key={key}
            href={`https://t.me/${entityText.slice(1)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            {entityText}
          </a>,
        );
        break;
      case "hashtag":
        result.push(
          <span key={key} className="text-primary/80">
            {entityText}
          </span>,
        );
        break;
      default:
        result.push(<span key={key}>{entityText}</span>);
    }

    cursor = entity.offset + entity.length;
  }

  if (cursor < chars.length) {
    const plain = chars.slice(cursor).join("");
    result.push(<span key="plain-end">{renderPlain(plain)}</span>);
  }

  return <p className="text-[14px] text-white/90 leading-relaxed mb-4 whitespace-pre-wrap break-words">{result}</p>;
}

function LinkPreviewCard({ preview }: { preview: LinkPreview }) {
  const domain = (() => {
    try {
      return new URL(preview.url).hostname.replace("www.", "");
    } catch {
      return preview.url;
    }
  })();

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group mb-4 flex overflow-hidden rounded-xl border border-border/40 bg-background/40 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
    >
      <div className="w-1 flex-shrink-0 bg-gradient-to-b from-primary/60 to-purple-500/60 rounded-l-xl" />

      <div className="flex flex-1 gap-3 p-3 min-w-0">
        <div className="flex-1 min-w-0">
          {(preview.site_name || domain) && (
            <div className="text-[10px] text-primary/70 font-medium uppercase tracking-wide mb-1 flex items-center gap-1">
              <ExternalLink size={9} />
              {preview.site_name || domain}
            </div>
          )}

          {preview.title && (
            <div className="text-sm font-semibold text-white/90 leading-snug mb-1 line-clamp-2 group-hover:text-white transition-colors">
              {preview.title}
            </div>
          )}

          {preview.description && (
            <div className="text-[11px] text-white/40 leading-relaxed line-clamp-2">{preview.description}</div>
          )}

          {!preview.title && <div className="text-xs text-blue-400/70 truncate">{preview.display_url || preview.url}</div>}
        </div>

        {preview.photo && (
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-border/30">
            <img
              src={preview.photo}
              alt="preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
      </div>
    </a>
  );
}

function TelegramEmbedCard({ embed }: { embed: TelegramEmbed }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetId = `tg-post-${embed.channelUsername}-${embed.messageId}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-post", `${embed.channelUsername}/${embed.messageId}`);
    script.setAttribute("data-width", "100%");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-color", "1f2937");
    script.setAttribute("data-dark", "1");
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [embed.channelUsername, embed.messageId]);

  return (
    <div className="mb-4 rounded-xl border border-border/40 bg-background/30 p-2 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 px-1 pb-2 text-[11px] text-white/45">
        <ExternalLink size={12} />
        Telegram preview
      </div>
      <div id={widgetId} ref={containerRef} className="telegram-embed-wrap min-h-[80px]" />
    </div>
  );
}

function MediaBlock({ post }: { post: Post }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      void audioRef.current.play();
      setPlaying(true);
    }
  };

  if (post.mediaType === "image" && post.imageUrl) {
    return (
      <div className="mb-4 rounded-xl overflow-hidden border border-border/40 shadow-lg">
        <img src={post.imageUrl} alt="post media" className="w-full max-h-64 object-cover hover:scale-[1.01] transition-transform duration-700" />
      </div>
    );
  }

  if (post.mediaType === "video" && post.videoUrl) {
    return (
      <div className="mb-4 rounded-xl overflow-hidden border border-border/40 shadow-lg bg-black/60">
        <video src={post.videoUrl} controls playsInline className="w-full max-h-72 rounded-xl" preload="metadata" />
      </div>
    );
  }

  if (post.mediaType === "gif" && post.videoUrl) {
    return (
      <div className="mb-4 rounded-xl overflow-hidden border border-border/40 shadow-lg bg-black/40">
        <video src={post.videoUrl} autoPlay loop muted playsInline className="w-full max-h-64 rounded-xl object-contain" />
      </div>
    );
  }

  if (post.mediaType === "sticker") {
    return (
      <div className="mb-4 flex items-center justify-start pl-1">
        {post.stickerUrl ? (
          <img src={post.stickerUrl} alt={post.stickerEmoji || "sticker"} className="w-28 h-28 object-contain" />
        ) : (
          <span className="text-6xl">{post.stickerEmoji || "🎭"}</span>
        )}
      </div>
    );
  }

  if ((post.mediaType === "audio" || post.mediaType === "voice") && post.audioUrl) {
    const isVoice = post.mediaType === "voice";
    return (
      <div className="mb-4 flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/40">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleAudio}
          className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0 hover:bg-primary/30 transition-all"
        >
          {playing ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
        </motion.button>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-white/80 truncate">
            {isVoice ? "🎤 Ovozli xabar" : `🎵 ${post.audioTitle || "Audio"}`}
          </div>
          {!isVoice && post.audioPerformer && (
            <div className="text-[10px] text-muted-foreground truncate mt-0.5">{post.audioPerformer}</div>
          )}
          <audio ref={audioRef} src={post.audioUrl} onEnded={() => setPlaying(false)} className="hidden" />
        </div>
      </div>
    );
  }

  if (post.mediaType === "document" && post.docUrl) {
    return (
      <a
        href={post.docUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-4 flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <LinkIcon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-white/85 truncate">{post.docName || "Fayl"}</div>
          {post.docMime && <div className="text-[10px] text-white/40 truncate">{post.docMime}</div>}
        </div>
        <ExternalLink size={14} className="text-white/35" />
      </a>
    );
  }

  return null;
}

function PostMenu({ postId, onDelete }: { postId: string; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDelete = async () => {
    const password = window.prompt("Admin paroli:");
    if (!password) return;
    if (password !== ADMIN_PASSWORD) {
      alert("Noto'g'ri parol!");
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/blog/posts/${postId}`, { method: "DELETE" });
      if (res.ok) onDelete(postId);
      else alert("O'chirishda xato!");
    } catch {
      alert("Server bilan bog'lanishda xato!");
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#post-${postId}`;
    void navigator.clipboard.writeText(url).then(() => setOpen(false));
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded-lg bg-background/50 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
      >
        <MoreHorizontal size={12} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-9 z-50 w-44 rounded-xl border border-border/50 bg-card/95 backdrop-blur-md shadow-2xl shadow-black/30 overflow-hidden"
          >
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <LinkIcon size={13} className="text-white/40" />
              Havolani nusxalash
            </button>
            <div className="h-px bg-border/30 mx-2" />
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              <Trash2 size={13} />
              {deleting ? "O'chirilmoqda..." : "O'chirish"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReactionBar({ reactions, postId, onReact }: {
  reactions: Reaction[];
  postId: string;
  onReact: (postId: string, emoji: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {reactions.map((r) => (
        <motion.button
          key={r.emoji}
          whileHover={{ scale: 1.06, y: -1 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => onReact(postId, r.emoji)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
            r.reacted
              ? "bg-primary/20 border-primary/40 text-primary shadow-lg shadow-primary/10"
              : "bg-background/50 border-border/40 text-white/60 hover:bg-background/70 hover:border-border/60 hover:text-white/80"
          }`}
        >
          <span className="text-sm leading-none">{r.emoji}</span>
          <span className="tabular-nums">{formatCount(r.count)}</span>
        </motion.button>
      ))}
    </div>
  );
}

function CommentSection({ post, onAddComment }: {
  post: Post;
  onAddComment: (postId: string, text: string, author: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [author, setAuthor] = useState("");
  const realCount = post.commentsCount ?? post.comments.length;

  const submit = () => {
    if (!input.trim()) return;
    onAddComment(post.id, input.trim(), author.trim() || "Anonim");
    setInput("");
  };

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white/80 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-background/50 border border-border/40 flex items-center justify-center">
          <MessageCircle size={13} />
        </div>
        <span className="text-xs font-medium">{realCount} ta fikr</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={13} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              {post.comments.length === 0 && (
                <div className="p-3 rounded-xl bg-background/30 border border-border/30 text-xs text-muted-foreground text-center italic">
                  Hali fikr yo'q — birinchi bo'ling!
                </div>
              )}

              {post.comments.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex gap-2.5 p-3 rounded-xl bg-background/30 border border-border/30"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                    {c.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-white/70">{c.author}</span>
                      {c.from_telegram === 1 && (
                        <span className="text-[9px] text-blue-400/80 bg-blue-400/10 border border-blue-400/20 px-1.5 py-0.5 rounded-md">
                          ✈️ Telegram
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">{formatTime(c.created_at)}</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap break-words">{c.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ismingiz (ixtiyoriy)"
                className="w-full bg-background/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-all"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Fikr bildiring..."
                  className="flex-1 bg-background/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-all"
                />
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={submit}
                  className="px-3 py-2 bg-primary/10 border border-primary/30 rounded-xl text-primary text-xs font-medium hover:bg-primary/20 transition-all"
                >
                  Yuborish
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PostCard({ post, onReact, onAddComment, onDelete }: {
  post: Post;
  onReact: (postId: string, emoji: string) => void;
  onAddComment: (postId: string, text: string, author: string) => void;
  onDelete: (id: string) => void;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <motion.article
      id={`post-${post.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -10 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl border border-border/40 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl shadow-black/10 overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative p-5 lg:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-500 rounded-xl blur-lg opacity-25" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary/80 to-purple-500/60 border border-primary/30 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                J
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-white/50 leading-tight">Jaloliddin Xalimov</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {formatDate(post.date)} · {formatTime(post.date)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setSaved((v) => !v)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                saved
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-background/50 border-border/40 text-muted-foreground hover:text-white"
              }`}
            >
              <Bookmark size={12} fill={saved ? "currentColor" : "none"} />
            </motion.button>
            <PostMenu postId={post.id} onDelete={onDelete} />
          </div>
        </div>

        <PostText text={post.text} entities={post.entities} />

        <MediaBlock post={post} />

        {post.telegramEmbed && <TelegramEmbedCard embed={post.telegramEmbed} />}
        {!post.telegramEmbed && post.linkPreview && <LinkPreviewCard preview={post.linkPreview} />}

        <div className="flex items-center gap-3 text-[10px] text-white/30 mb-2.5">
          <span className="flex items-center gap-1">
            <Share2 size={10} /> {formatCount(post.views)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={10} /> {post.commentsCount ?? post.comments.length}
          </span>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border/30 to-transparent mb-3" />

        <div className="mb-3">
          <ReactionBar reactions={post.reactions} postId={post.id} onReact={onReact} />
        </div>

        <CommentSection post={post} onAddComment={onAddComment} />
      </div>
    </motion.article>
  );
}

export function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPostCount, setNewPostCount] = useState(0);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef(true);

  const checkIfAtBottom = useCallback(() => {
    const threshold = 120;
    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - threshold;
    isAtBottomRef.current = atBottom;
    if (atBottom) setNewPostCount(0);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", checkIfAtBottom, { passive: true });
    return () => window.removeEventListener("scroll", checkIfAtBottom);
  }, [checkIfAtBottom]);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    setNewPostCount(0);
  }, []);

  const enrichPosts = useCallback((data: any[]) => {
    return data.map((p: any) => {
      const reactionMap = new Map((p.reactions || []).map((r: any) => [r.emoji, r.count]));
      return {
        ...p,
        comments: p.comments || [],
        entities: p.entities || [],
        linkPreview: p.linkPreview || null,
        telegramEmbed: p.telegramEmbed || null,
        reactions: DEFAULT_REACTIONS.map((r) => ({
          ...r,
          count: Number(reactionMap.get(r.emoji) || 0),
          reacted: false,
        })),
      } as Post;
    });
  }, []);

  const fetchPosts = useCallback(
    async (isInitial = false) => {
      try {
        const res = await fetch(`${API_URL}/blog/posts`);
        if (!res.ok) throw new Error("Server xatosi");
        const data = await res.json();
        const enriched = enrichPosts(data).reverse();

        setPosts((prev) => {
          const newIds = new Set(enriched.map((p) => p.id));
          const prevIds = new Set(prev.map((p) => p.id));
          const addedCount = [...newIds].filter((id) => !prevIds.has(id)).length;

          if (!isInitial && addedCount > 0) {
            if (isAtBottomRef.current) setTimeout(() => scrollToBottom(), 100);
            else setNewPostCount((n) => n + addedCount);
          }

          return enriched;
        });

        setError(null);
      } catch {
        setError("Postlarni yuklashda xato.");
      } finally {
        if (isInitial) setLoading(false);
      }
    },
    [enrichPosts, scrollToBottom],
  );

  useEffect(() => {
    void fetchPosts(true).then(() => setTimeout(() => scrollToBottom(false), 150));
    const interval = setInterval(() => {
      void fetchPosts(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchPosts, scrollToBottom]);

  const handleReact = async (postId: string, emoji: string) => {
    let nextDelta = 1;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          reactions: p.reactions.map((r) => {
            if (r.emoji !== emoji) return r;
            nextDelta = r.reacted ? -1 : 1;
            return {
              ...r,
              count: Math.max(0, r.reacted ? r.count - 1 : r.count + 1),
              reacted: !r.reacted,
            };
          }),
        };
      }),
    );

    try {
      await fetch(`${API_URL}/blog/reactions/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji, delta: nextDelta }),
      });
    } catch {
      void fetchPosts(false);
    }
  };

  const handleAddComment = async (postId: string, text: string, author: string) => {
    try {
      const res = await fetch(`${API_URL}/blog/comments/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, text }),
      });
      if (!res.ok) throw new Error();
      const newComment = await res.json();
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [...p.comments, newComment],
                commentsCount: (p.commentsCount ?? p.comments.length) + 1,
              }
            : p,
        ),
      );
    } catch {
      void fetchPosts(false);
    }
  };

  const handleDelete = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <main className="relative min-h-screen bg-[#020202] selection:bg-primary/30 overflow-x-hidden">
      <style>{`
        .blog-aurora { filter: blur(70px); opacity: .32; background: radial-gradient(40% 40% at 25% 20%, rgba(99,102,241,.16), transparent 60%), radial-gradient(45% 45% at 75% 30%, rgba(168,85,247,.12), transparent 60%), radial-gradient(50% 50% at 50% 80%, rgba(34,197,94,.04), transparent 62%); animation: auroraShift 14s ease-in-out infinite alternate; transform: translateZ(0); }
        @keyframes auroraShift { 0% { transform: translate3d(-2%, -1%, 0) scale(1); } 100% { transform: translate3d(2%, 1%, 0) scale(1.05); } }
        .page-grid { background-image: linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.05) 1px, transparent 1px); background-size: 30px 30px; mask-image: radial-gradient(60% 55% at 50% 18%, black, transparent 72%); opacity: .20; animation: gridBreath 8s ease-in-out infinite; }
        @keyframes gridBreath { 0%,100% { opacity: .16; transform: translateY(0); } 50% { opacity: .24; transform: translateY(6px); } }
        .page-vignette { background: radial-gradient(70% 55% at 50% 25%, rgba(255,255,255,.02), transparent 62%), radial-gradient(85% 80% at 50% 50%, transparent, rgba(0,0,0,.68)); }
        .premium-title { background: linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,.62), rgba(255,255,255,1)); -webkit-background-clip: text; background-clip: text; color: transparent; background-size: 200% 100%; animation: titleSheen 3.8s ease-in-out infinite; }
        @keyframes titleSheen { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .premium-divider { height: 1px; width: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.10), transparent); }
        .telegram-embed-wrap iframe, .telegram-embed-wrap blockquote { width: 100% !important; }
      `}</style>

      <PageBackground />

      <section className="pt-24 pb-10 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 bg-background/50 backdrop-blur-sm mb-6"
        >
          <span className="text-sm text-white/50">✈️ Personal · blog</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl font-bold mb-4 premium-title"
        >
          Blog | Блог
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="text-white/40 text-base max-w-md mx-auto"
        >
          Jaloliddinning shaxsiy blogi | Jaloliddin&apos;s personal blog
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 premium-divider" />
      </section>

      <section className="max-w-2xl mx-auto px-4 pb-24 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-primary/50" />
          </div>
        )}

        {error && (
          <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
            <p className="text-red-400/80 text-sm">{error}</p>
            <button onClick={() => void fetchPosts(true)} className="mt-3 text-xs text-primary hover:underline">
              Qayta urinish
            </button>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="p-10 rounded-2xl border border-border/40 bg-gradient-to-br from-card to-card/50 text-center">
            <p className="text-4xl mb-3">✈️</p>
            <p className="text-white/60 font-medium">Hali postlar yo&apos;q</p>
            <p className="text-white/30 text-sm mt-1">Birinchi post yozilishini kutmoqda...</p>
          </div>
        )}

        <AnimatePresence>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onReact={handleReact}
              onAddComment={handleAddComment}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </section>

      <AnimatePresence>
        {newPostCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            onClick={() => scrollToBottom()}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all"
          >
            <ArrowDown size={15} />
            {newPostCount} ta yangi post
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
}
