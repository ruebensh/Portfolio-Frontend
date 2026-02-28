import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Share2, Bookmark, MoreHorizontal, Play, ChevronDown, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ─── Types ────────────────────────────────────────────────────────────────────

type Reaction = { emoji: string; label: string; count: number; reacted: boolean };
type Comment = { id: string; author: string; text: string; created_at: string; from_telegram: number };
type Post = {
  id: string;
  text: string;
  date: string;
  views: number;
  imageUrl?: string;
  videoUrl?: string;
  reactions: Reaction[];
  comments: Comment[];
};

// Default reaksiyalar — har bir postga
const DEFAULT_REACTIONS = [
  { emoji: "🔥", label: "fire" },
  { emoji: "👍", label: "like" },
  { emoji: "❤️", label: "heart" },
  { emoji: "🤯", label: "mind-blown" },
];

// ─── PageBackground ───────────────────────────────────────────────────────────

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
    let w = 0, h = 0;
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.floor(w * DPR); canvas.height = Math.floor(h * DPR);
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type Star = { x: number; y: number; z: number; r: number; tw: number; p: number };
    type Meteor = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; w: number; z: number; r: number; hue: number; fadeIn: number };

    const starCount = Math.floor(Math.min(700, Math.max(320, (w * h) / 2200)));
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * w, y: Math.random() * h, z: Math.pow(Math.random(), 1.9),
      r: 0.28 + Math.random() * 1.05, tw: 0.25 + Math.random() * 0.95, p: Math.random() * Math.PI * 2,
    }));
    const meteors: Meteor[] = [];

    const spawnMeteor = () => {
      if (prefersReduced || Math.random() > 0.028) return;
      const z = Math.random() < 0.15 ? 0.75 + Math.random() * 0.25 : Math.pow(Math.random(), 2.2);
      const baseAngle = (Math.PI * 7) / 6;
      const angle = baseAngle + (Math.random() - 0.5) * (0.22 + (1 - z) * 0.18);
      const speed = (10 + Math.random() * 6) * (0.65 + z * 1.25);
      const vx = Math.cos(angle) * speed, vy = Math.sin(angle) * speed;
      const entryX = Math.random() * w * 0.9 + w * 0.05;
      const entryY = Math.random() * h * 0.30 + h * 0.02;
      const margin = 220 + z * 220;
      meteors.push({ x: entryX - vx * (margin / 10), y: entryY - vy * (margin / 10), vx, vy, life: 0, maxLife: (38 + Math.random() * 38) * (0.7 + z * 0.85), w: (210 + Math.random() * 260) * (0.55 + z * 1.15), z, r: (0.9 + Math.random() * 1.5) * (0.55 + z * 1.35), hue: 200 + Math.random() * 40, fadeIn: Math.floor(6 + Math.random() * 10 + z * 6) });
      if (meteors.length > 8) meteors.shift();
    };

    const drawGlowStar = (x: number, y: number, radius: number, alpha: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius * 6);
      g.addColorStop(0, `rgba(255,255,255,${alpha})`);
      g.addColorStop(0.25, `rgba(255,255,255,${alpha * 0.3})`);
      g.addColorStop(1, `rgba(255,255,255,0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, radius * 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha * 1.05)})`; ctx.beginPath(); ctx.arc(x, y, Math.max(0.55, radius), 0, Math.PI * 2); ctx.fill();
    };

    const onMove = (e: PointerEvent) => { mouseRef.current.x = e.clientX / window.innerWidth - 0.5; mouseRef.current.y = e.clientY / window.innerHeight - 0.5; };
    const onScroll = () => { scrollRef.current.y = window.scrollY || 0; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
      const m = mouseRef.current;
      m.tx += (m.x - m.tx) * 0.06; m.ty += (m.y - m.ty) * 0.06;
      const s = scrollRef.current;
      s.ty += (s.y - s.ty) * 0.14;
      const parallax = s.ty * 0.2;
      const bg = ctx.createRadialGradient(w * 0.5 + m.tx * 60, h * 0.35 + m.ty * 40, Math.min(w, h) * 0.12, w * 0.5, h * 0.5, Math.max(w, h) * 0.95);
      bg.addColorStop(0, "rgba(255,255,255,0.010)"); bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      for (const st of stars) {
        if (!prefersReduced) { st.y += (0.02 + st.z * 0.12) * 0.6 * 1.85; if (st.y > h + 40) st.y = -40; }
        const depth = 0.22 + st.z * 0.85;
        const twinkle = prefersReduced ? 1 : 0.8 + 0.2 * Math.sin(t * 0.0011 * st.tw + st.p);
        const alpha = Math.min(0.7, depth * 0.55 * twinkle);
        const radius = st.r * (0.75 + st.z * 1.0);
        const px = st.x + m.tx * (st.z - 0.2) * 14;
        const py = st.y + m.ty * (st.z - 0.2) * 12 - parallax * (0.35 + st.z * 1.35);
        drawGlowStar(px, py, radius, alpha);
        if (st.z > 0.84 && twinkle > 0.94) {
          ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.35})`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(px - 6, py); ctx.lineTo(px + 6, py); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(px, py - 6); ctx.lineTo(px, py + 6); ctx.stroke();
        }
      }
      if (!prefersReduced) spawnMeteor();
      ctx.globalCompositeOperation = "lighter";
      for (let i = meteors.length - 1; i >= 0; i--) {
        const mt = meteors[i];
        mt.life += 1; mt.x += mt.vx; mt.y += mt.vy;
        const k = 1 - mt.life / mt.maxLife;
        const appear = Math.min(1, mt.life / mt.fadeIn);
        const a = Math.max(0, Math.min(0.42, k * (0.1 + mt.z * 0.3))) * appear;
        const tx = mt.x - mt.vx * (mt.w / 12) * (0.15 + 0.85 * appear);
        const ty = mt.y - mt.vy * (mt.w / 12) * (0.15 + 0.85 * appear);
        const grad = ctx.createLinearGradient(mt.x, mt.y, tx, ty);
        grad.addColorStop(0, `hsla(${mt.hue}, 95%, 92%, ${a})`);
        grad.addColorStop(0.25, `hsla(${mt.hue}, 90%, 85%, ${a * 0.55})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad; ctx.lineWidth = (1.0 + mt.z * 2.2) * (0.85 + 0.15 * appear);
        ctx.beginPath(); ctx.moveTo(mt.x, mt.y); ctx.lineTo(tx, ty); ctx.stroke();
        drawGlowStar(mt.x, mt.y, mt.r, a * (1.2 + mt.z));
        if (mt.life > mt.maxLife || mt.x < -500 || mt.y > h + 500 || mt.x > w + 500 || mt.y < -500) meteors.splice(i, 1);
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
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

function parseText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i} className="text-white/80 italic">{part.slice(1, -1)}</em>;
    return part.split("\n").map((line, j) => (
      <span key={`${i}-${j}`}>{j > 0 && <br />}{line}</span>
    ));
  });
}

// ─── ReactionBar ──────────────────────────────────────────────────────────────

function ReactionBar({ reactions, postId, onReact }: {
  reactions: Reaction[];
  postId: string;
  onReact: (postId: string, emoji: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
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
          <span className="text-base leading-none">{r.emoji}</span>
          <span className="tabular-nums text-xs">{formatCount(r.count)}</span>
        </motion.button>
      ))}
    </div>
  );
}

// ─── CommentSection ───────────────────────────────────────────────────────────

function CommentSection({ post, onAddComment }: {
  post: Post;
  onAddComment: (postId: string, text: string, author: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [author, setAuthor] = useState("");

  const submit = () => {
    if (!input.trim()) return;
    onAddComment(post.id, input.trim(), author.trim() || "Anonim");
    setInput("");
  };

  const telegramComments = post.comments.filter(c => c.from_telegram === 1);
  const siteComments = post.comments.filter(c => c.from_telegram === 0);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-background/50 border border-border/40 flex items-center justify-center">
          <MessageCircle size={15} />
        </div>
        <span className="font-medium">{post.comments.length} ta fikr</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={14} />
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
            <div className="mt-4 space-y-3">
              {post.comments.length === 0 && (
                <div className="p-3 rounded-xl bg-background/30 border border-border/30 text-xs text-muted-foreground text-center italic">
                  Hali fikr yo'q — birinchi bo'ling!
                </div>
              )}
              {post.comments.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 p-3 rounded-xl bg-background/30 border border-border/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    {c.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-white">{c.author}</span>
                      {c.from_telegram === 1 && (
                        <span className="text-[10px] text-blue-400/80 bg-blue-400/10 border border-blue-400/20 px-1.5 py-0.5 rounded-md">
                          ✈️ Telegram
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">{formatTime(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.text}</p>
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
                className="w-full bg-background/50 border border-border/40 rounded-xl px-4 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-all"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Fikr bildiring..."
                  className="flex-1 bg-background/50 border border-border/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:bg-background/70 transition-all"
                />
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={submit}
                  className="px-4 py-2.5 bg-primary/10 border border-primary/30 rounded-xl text-primary text-sm font-medium hover:bg-primary/20 transition-all"
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

// ─── PostCard ─────────────────────────────────────────────────────────────────

function PostCard({ post, index, onReact, onAddComment }: {
  post: Post;
  index: number;
  onReact: (postId: string, emoji: string) => void;
  onAddComment: (postId: string, text: string, author: string) => void;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl border border-border/40 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-2xl shadow-black/5 overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-500 rounded-xl blur-lg opacity-30" />
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary/80 to-purple-500/60 border border-primary/30 flex items-center justify-center text-base font-bold text-white shadow-xl">
                J
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-white/50 leading-tight">Jaloliddin Xalimov</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {formatDate(post.date)} · {formatTime(post.date)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setSaved(v => !v)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                saved ? "bg-primary/10 border-primary/30 text-primary" : "bg-background/50 border-border/40 text-muted-foreground hover:text-white"
              }`}
            >
              <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
            </motion.button>
            <button className="w-8 h-8 rounded-lg bg-background/50 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>

        {/* Text */}
        <p className="text-[15px] text-white/90 leading-relaxed mb-5">
          {parseText(post.text)}
        </p>

        {/* Media */}
        {post.imageUrl && (
          <div className="mb-5 rounded-xl overflow-hidden border border-border/40 shadow-xl">
            <img src={post.imageUrl} alt="" className="w-full max-h-72 object-cover group-hover:scale-[1.01] transition-transform duration-700" />
          </div>
        )}
        {post.videoUrl && (
          <div className="mb-5 rounded-xl overflow-hidden border border-border/40 bg-black/40 flex items-center justify-center h-48 cursor-pointer">
            <motion.div whileHover={{ scale: 1.1 }} className="w-14 h-14 rounded-full bg-background/50 backdrop-blur border border-border/40 flex items-center justify-center shadow-xl">
              <Play size={22} className="text-white ml-1" />
            </motion.div>
          </div>
        )}

        {/* Stats inline */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><Share2 size={11} /> {formatCount(post.views)}</span>
          <span className="flex items-center gap-1"><MessageCircle size={11} /> {post.comments.length}</span>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent mb-3" />

        <div className="mb-3">
          <ReactionBar reactions={post.reactions} postId={post.id} onReact={onReact} />
        </div>

        <CommentSection post={post} onAddComment={onAddComment} />
      </div>
    </motion.article>
  );
}

// ─── BlogPage ─────────────────────────────────────────────────────────────────

export function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Postlarni backend dan olish
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/blog/posts`);
      if (!res.ok) throw new Error("Server xatosi");
      const data = await res.json();

      // Backend dan kelgan postlarga default reaksiyalar qo'shamiz
      const enriched = data.map((p: any) => {
        const reactionMap = new Map(p.reactions.map((r: any) => [r.emoji, r.count]));
        return {
          ...p,
          reactions: DEFAULT_REACTIONS.map(r => ({
            ...r,
            count: (reactionMap.get(r.emoji) as number) || 0,
            reacted: false,
          })),
        };
      });

      setPosts(enriched);
    } catch (e) {
      setError("Postlarni yuklashda xato. Backend ishlayaptimi?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // Har 30 sekundda yangi postlarni tekshirish
    const interval = setInterval(fetchPosts, 1000);
    return () => clearInterval(interval);
  }, []);

  // Reaksiya bosish
  const handleReact = async (postId: string, emoji: string) => {
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        reactions: p.reactions.map(r =>
          r.emoji === emoji
            ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
            : r
        ),
      };
    }));

    // Backend ga yuborish
    const post = posts.find(p => p.id === postId);
    const reaction = post?.reactions.find(r => r.emoji === emoji);
    const delta = reaction?.reacted ? -1 : 1;

    try {
      await fetch(`${API_URL}/blog/reactions/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji, delta }),
      });
    } catch {}
  };

  // Komment qo'shish
  const handleAddComment = async (postId: string, text: string, author: string) => {
    try {
      const res = await fetch(`${API_URL}/blog/comments/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, text }),
      });
      const newComment = await res.json();

      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      ));
    } catch {}
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
      `}</style>

      <PageBackground />

      {/* Header */}
      <section className="pt-24 pb-12 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 bg-background/50 backdrop-blur-sm mb-6"
        >
          <span className="text-sm text-white/50">✈️ Telegram kanal · blog</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl font-bold mb-4 premium-title"
        >
          Fikrlar & Yangiliklar
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="text-white/40 text-base max-w-md mx-auto"
        >
          AI, muhandislik va hayot haqidagi qisqa fikrlar
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 premium-divider"
        />
      </section>

      {/* Posts Feed */}
      <section className="max-w-2xl mx-auto px-4 pb-24 space-y-5">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary/50" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
            <p className="text-red-400/80 text-sm">{error}</p>
            <button onClick={fetchPosts} className="mt-3 text-xs text-primary hover:underline">
              Qayta urinish
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && posts.length === 0 && (
          <div className="p-10 rounded-2xl border border-border/40 bg-gradient-to-br from-card to-card/50 text-center">
            <p className="text-4xl mb-3">✈️</p>
            <p className="text-white/60 font-medium">Hali postlar yo'q</p>
            <p className="text-white/30 text-sm mt-1">@ruebensh_blog kanalida birinchi post yozilishini kutmoqda</p>
          </div>
        )}

        {/* Posts */}
        {posts.map((post, i) => (
          <PostCard
            key={post.id}
            post={post}
            index={i}
            onReact={handleReact}
            onAddComment={handleAddComment}
          />
        ))}

        {!loading && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center pt-4 text-white/20 text-sm"
          >
            Barcha postlar yuklandi · @ruebensh_blog kanalga obuna bo'ling
          </motion.div>
        )}
      </section>
    </main>
  );
}