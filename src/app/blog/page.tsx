"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { EyebrowBadge } from "@/components/ui/EyebrowBadge";
import { getBlogPosts, API_URL, resolveUrl } from "@/lib/api";
import {
  ChatCircle,
  ArrowSquareOut,
  Clock,
  Play,
  Pause,
  FileText,
  MapPin,
  Phone,
  Smiley,
  Plus,
  Trash,
  ShareNetwork,
  ThumbsUp,
  Heart,
  Fire
} from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";

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

type MediaItem = {
  id: number | string;
  type: string; // 'image' | 'video' | 'gif' | 'video_note' | 'audio' | 'voice' | 'sticker' | 'document'
  url?: string | null;
  thumbnailUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  duration?: number | null;
  title?: string | null;
  performer?: string | null;
  emoji?: string | null;
};

const DEFAULT_EMOJIS = ["👍", "👎", "❤️", "🔥", "🥰", "👏", "😁", "🤔", "🤯", "🎉", "🤩", "⚡", "💯", "🚀"];

function formatFileSize(bytes?: number | null) {
  if (!bytes) return null;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function PostText({ text, entities }: { text: string; entities?: TgEntity[] }) {
  const { td } = useLanguage();
  if (!text) return null;

  const translatedText = td(text);

  if (!entities || entities.length === 0) {
    return <p className="text-sm md:text-base text-foreground/90 font-sans leading-relaxed mb-4 whitespace-pre-wrap break-words">{translatedText}</p>;
  }

  const chars = Array.from(text);
  const sorted = [...entities].sort((a, b) => a.offset - b.offset);
  const result: React.ReactNode[] = [];
  let cursor = 0;

  for (const entity of sorted) {
    if (entity.offset < cursor) continue;

    if (entity.offset > cursor) {
      const plain = chars.slice(cursor, entity.offset).join("");
      result.push(<span key={`plain-${cursor}`}>{plain}</span>);
    }

    const entityText = chars.slice(entity.offset, entity.offset + entity.length).join("");
    const key = `entity-${entity.offset}-${entity.type}`;

    switch (entity.type) {
      case "url":
      case "text_link":
        result.push(
          <a key={key} href={entity.url || (entityText.startsWith("http") ? entityText : `https://${entityText}`)} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all">
            {entityText}
          </a>
        );
        break;
      case "bold":
        result.push(<strong key={key} className="text-white font-bold">{entityText}</strong>);
        break;
      case "italic":
        result.push(<em key={key} className="text-white/80 italic">{entityText}</em>);
        break;
      case "code":
        result.push(
          <code key={key} className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono text-accent">
            {entityText}
          </code>
        );
        break;
      case "pre":
        result.push(
          <pre key={key} className="p-3 rounded-xl bg-black/60 text-xs font-mono text-accent overflow-x-auto my-2 whitespace-pre-wrap border border-white/10">
            {entityText}
          </pre>
        );
        break;
      case "mention":
        result.push(
          <a key={key} href={`https://t.me/${entityText.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            {entityText}
          </a>
        );
        break;
      default:
        result.push(<span key={key}>{entityText}</span>);
    }

    cursor = entity.offset + entity.length;
  }

  if (cursor < chars.length) {
    const plain = chars.slice(cursor).join("");
    result.push(<span key="plain-end">{plain}</span>);
  }

  return <p className="text-sm md:text-base text-foreground/90 font-sans leading-relaxed mb-4 whitespace-pre-wrap break-words">{result}</p>;
}

// Media Gallery Component supporting Images, Videos, GIFs, Video Notes, Audio, Voice, Stickers, Documents
function MediaGallery({ post }: { post: any }) {
  // Collect all media items from post
  const items: MediaItem[] = [];

  if (Array.isArray(post.media) && post.media.length > 0) {
    post.media.forEach((m: any) => {
      items.push({
        ...m,
        url: resolveUrl(m.url || m.fileUrl),
        thumbnailUrl: resolveUrl(m.thumbnailUrl || m.thumb),
      });
    });
  } else {
    // Single media fallbacks
    if (post.imageUrl || post.photo) {
      items.push({ id: "photo", type: "image", url: resolveUrl(post.imageUrl || post.photo) });
    }
    if (post.videoUrl || post.video) {
      items.push({ id: "video", type: "video", url: resolveUrl(post.videoUrl || post.video) });
    }
    if (post.audioUrl || post.audio || post.voiceUrl) {
      items.push({
        id: "audio",
        type: post.voiceUrl ? "voice" : "audio",
        url: resolveUrl(post.audioUrl || post.audio || post.voiceUrl),
        title: post.audioTitle || post.title,
        performer: post.audioPerformer || post.performer,
      });
    }
    if (post.stickerUrl || post.sticker) {
      items.push({ id: "sticker", type: "sticker", url: resolveUrl(post.stickerUrl || post.sticker), emoji: post.stickerEmoji });
    }
    if (post.docUrl || post.document) {
      items.push({
        id: "doc",
        type: "document",
        url: resolveUrl(post.docUrl || post.document),
        fileName: post.docName || post.fileName || "Hujjat fayli",
      });
    }
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex] || items[0];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  if (!active) return null;

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  const renderActiveItem = (item: MediaItem) => {
    if (item.type === "image" && item.url) {
      return (
        <div className="relative w-full max-h-[32rem] overflow-hidden rounded-2xl border border-white/10 bg-black/40 flex items-center justify-center">
          <img src={item.url} alt="post media" className="w-full h-full max-h-[32rem] object-contain" />
        </div>
      );
    }

    if ((item.type === "video" || item.type === "gif") && item.url) {
      return (
        <div className="relative w-full max-h-[32rem] overflow-hidden rounded-2xl border border-white/10 bg-black">
          <video
            src={item.url}
            controls={item.type !== "gif"}
            autoPlay={item.type === "gif"}
            loop={item.type === "gif"}
            muted={item.type === "gif"}
            playsInline
            className="w-full h-full max-h-[32rem] object-contain"
          />
        </div>
      );
    }

    if (item.type === "video_note" && item.url) {
      return (
        <div className="flex justify-center p-4 bg-black/60 rounded-2xl border border-white/10">
          <video src={item.url} controls playsInline className="w-64 h-64 rounded-full object-cover border-2 border-accent/40 shadow-2xl" />
        </div>
      );
    }

    if ((item.type === "audio" || item.type === "voice") && item.url) {
      return (
        <div className="p-4 rounded-2xl border border-white/15 bg-[#121222]/90 flex items-center gap-4">
          <button
            onClick={toggleAudio}
            className="w-12 h-12 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center font-bold shadow-lg hover:scale-105 transition-transform"
          >
            {playing ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" className="ml-0.5" />}
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-display font-bold text-white truncate">
              {item.type === "voice" ? "🎙️ Ovozli xabar" : item.title || item.fileName || "Audio trek"}
            </div>
            {(item.performer || item.duration) && (
              <div className="text-xs font-mono text-muted truncate mt-0.5">
                {[item.performer, item.duration ? `${item.duration}s` : null].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
          <audio ref={audioRef} src={item.url} onEnded={() => setPlaying(false)} className="hidden" />
        </div>
      );
    }

    if (item.type === "sticker") {
      return (
        <div className="p-6 flex items-center justify-center bg-black/40 rounded-2xl border border-white/10">
          {item.url ? (
            <img src={item.url} alt={item.emoji || "sticker"} className="w-40 h-40 object-contain" />
          ) : (
            <div className="text-7xl">{item.emoji || "🎭"}</div>
          )}
        </div>
      );
    }

    if (item.type === "document" && item.url) {
      return (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl border border-white/15 bg-[#121222]/90 flex items-center gap-4 hover:border-accent transition-all group">
          <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
            <FileText size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-display font-bold text-white group-hover:text-accent transition-colors truncate">
              {item.fileName || "Hujjat fayli"}
            </div>
            <div className="text-xs font-mono text-muted truncate mt-0.5">
              {[formatFileSize(item.fileSize)].filter(Boolean).join(" · ")}
            </div>
          </div>
          <ArrowSquareOut size={18} className="text-accent" />
        </a>
      );
    }

    return null;
  };

  return (
    <div className="mb-5 space-y-3">
      {renderActiveItem(active)}

      {/* Gallery thumbnails carousel if multiple items */}
      {items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {items.map((item, idx) => (
            <button
              key={`${item.id}-${idx}`}
              onClick={() => setActiveIndex(idx)}
              className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border transition-all ${
                idx === activeIndex ? "border-accent ring-2 ring-accent/30 scale-105" : "border-white/15 opacity-60 hover:opacity-100"
              }`}
            >
              {item.type === "image" && item.url ? (
                <img src={item.url} alt="thumb" className="w-full h-full object-cover" />
              ) : item.thumbnailUrl ? (
                <img src={item.thumbnailUrl} alt="thumb" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-black/80 flex items-center justify-center text-accent text-[10px] font-mono text-center p-1 uppercase">
                  {item.type}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Link Preview Card Component
function LinkPreviewCard({ preview }: { preview: LinkPreview }) {
  if (!preview || !preview.url) return null;
  return (
    <a href={preview.url} target="_blank" rel="noopener noreferrer" className="block mb-5 p-4 rounded-2xl border border-accent/30 bg-[#0e0e1a]/90 backdrop-blur-xl hover:border-accent transition-all group">
      <div className="flex gap-4 items-start">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1 flex items-center gap-1">
            <ArrowSquareOut size={12} /> {preview.site_name || preview.url}
          </div>
          {preview.title && <div className="text-sm font-bold text-white mb-1 group-hover:text-accent transition-colors leading-snug line-clamp-2">{preview.title}</div>}
          {preview.description && <div className="text-xs text-muted line-clamp-2 leading-relaxed">{preview.description}</div>}
        </div>
        {preview.photo && (
          <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 shrink-0">
            <img src={resolveUrl(preview.photo)} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </a>
  );
}

// Reaction Bar Component with Emoji Picker
function ReactionBar({ post, onReact }: { post: any; onReact: (postId: string, emoji: string) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const reactions: any[] = Array.isArray(post.reactions)
    ? post.reactions
    : Object.entries(post.reactions || {}).map(([emoji, count]) => ({
        emoji: typeof count === "object" ? (count as any).emoji || emoji : emoji,
        count: typeof count === "object" ? (count as any).count || 0 : Number(count),
      }));

  return (
    <div className="relative flex flex-wrap items-center gap-2">
      {reactions.map((r: any, idx: number) => (
        <button
          key={r.emoji || idx}
          onClick={() => onReact(post.id, r.emoji)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
            r.reacted
              ? "bg-accent/20 border-accent text-accent font-bold shadow-sm"
              : "bg-white/5 border-white/10 text-foreground/80 hover:border-accent/40 hover:text-accent"
          }`}
        >
          <span>{r.emoji}</span>
          <span>{r.count}</span>
        </button>
      ))}

      <button
        onClick={() => setPickerOpen(!pickerOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 text-muted hover:text-accent hover:border-accent/40 text-xs font-mono transition-all"
      >
        <Smiley size={16} /> Reaksiya
      </button>

      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute left-0 bottom-full mb-2 z-50 p-3 rounded-2xl border border-accent/40 bg-[#0a0a14]/95 backdrop-blur-2xl shadow-2xl flex flex-wrap gap-2 max-w-xs"
          >
            {DEFAULT_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact(post.id, emoji);
                  setPickerOpen(false);
                }}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-accent/20 hover:scale-110 text-lg flex items-center justify-center transition-all"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Comments Section Component
function CommentSection({ post }: { post: any }) {
  const { td } = useLanguage();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<any[]>(post.comments || []);
  const [input, setInput] = useState("");
  const [author, setAuthor] = useState("");

  const submitComment = async () => {
    if (!input.trim()) return;
    const newComment = {
      id: Date.now(),
      author: author.trim() || "Foydalanuvchi",
      text: input.trim(),
      created_at: new Date().toISOString(),
    };
    setComments((prev) => [...prev, newComment]);
    setInput("");

    try {
      await fetch(`${API_URL}/blog/comments/${post.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment.text, author: newComment.author }),
      });
    } catch {}
  };

  return (
    <div className="w-full pt-4 border-t border-white/10 mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs font-mono text-muted hover:text-accent transition-colors"
      >
        <ChatCircle size={16} /> {comments.length} {td("ta fikr")} {open ? "▲" : "▼"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 pt-4">
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-none">
              {comments.length === 0 && <p className="text-xs font-mono text-muted italic">{td("Birinchi bo'lib fikr qoldiring!")}</p>}
              {comments.map((c: any, idx: number) => (
                <div key={c.id || idx} className="p-3 rounded-xl border border-white/10 bg-[#141424]/80 backdrop-blur-md">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-accent font-display">{c.author || "Anonim"}</span>
                    {c.created_at && <span className="text-[9px] font-mono text-muted">{new Date(c.created_at).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}</span>}
                  </div>
                  <p className="text-xs font-sans text-white/90 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <input
                type="text"
                placeholder={td("Ismingiz (ixtiyoriy)")}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/60 p-2.5 text-xs text-white placeholder:text-muted/60 outline-none focus:border-accent"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={td("Fikringizni yozing...")}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitComment()}
                  className="flex-1 rounded-xl border border-white/15 bg-black/60 p-2.5 text-xs text-white placeholder:text-muted/60 outline-none focus:border-accent"
                />
                <button
                  onClick={submitComment}
                  className="px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest font-bold hover:bg-accent/90 transition-all"
                >
                  {td("Yuborish")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BlogPage() {
  const { td } = useLanguage();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const data = await getBlogPosts();
      setPosts(data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleReact = async (postId: string, emoji: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const currentReactions = Array.isArray(p.reactions) ? p.reactions : [];
        const existing = currentReactions.find((r: any) => r.emoji === emoji);

        let updatedReactions;
        if (existing) {
          updatedReactions = currentReactions.map((r: any) =>
            r.emoji === emoji ? { ...r, count: r.count + (r.reacted ? -1 : 1), reacted: !r.reacted } : r
          );
        } else {
          updatedReactions = [...currentReactions, { emoji, count: 1, reacted: true }];
        }
        return { ...p, reactions: updatedReactions };
      })
    );

    try {
      await fetch(`${API_URL}/blog/reactions/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
    } catch {}
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto p-6 sm:p-10 md:p-12 rounded-3xl border border-card-border/80 bg-card-bg/75 backdrop-blur-2xl shadow-2xl">
        <AnimatedSection>
          <AnimatedItem className="mb-12">
            <EyebrowBadge className="mb-4">{td("Blog & Telegram Feed")}</EyebrowBadge>
            <h1 className="heading-gradient-purple text-4xl md:text-6xl font-bold tracking-tighter mb-4 font-display">
              {td("Blog & Fikrlar")}
            </h1>
            <p className="page-subtitle">
              {td("Texnologiya, sun'iy intellekt, dasturlash va o'rganish haqidagi so'nggi postlar hamda media kontentlar.")}
            </p>
          </AnimatedItem>

          {posts.length === 0 ? (
            <AnimatedItem>
              <div className="card-surface p-16 text-center rounded-3xl border border-white/15 bg-[#0f0f1b]/80 backdrop-blur-xl">
                <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mx-auto mb-4">
                  <ChatCircle size={32} />
                </div>
                <h3 className="text-xl font-bold font-display text-white mb-2">Postlar yuklanmoqda...</h3>
                <p className="text-xs font-mono text-muted">Telegram kanal va backenddan yangi postlar avtomatik yuklanadi.</p>
              </div>
            </AnimatedItem>
          ) : (
            <div className="space-y-8">
              {posts.map((post: any, idx: number) => (
                <AnimatedItem key={post.id ?? idx}>
                  <div className="card-surface p-6 sm:p-8 rounded-3xl border border-white/15 bg-[#0f0f1b]/85 backdrop-blur-2xl shadow-xl hover:-translate-y-1 transition-all duration-300">
                    
                    {/* Media Gallery (Photos, Videos, GIFs, Video Notes, Audio, Voice, Stickers, Documents) */}
                    <MediaGallery post={post} />

                    {/* Link Preview */}
                    {post.linkPreview && <LinkPreviewCard preview={post.linkPreview} />}

                    {/* Post Text & Entities (Formatted Markdown, Links, Code, Mentions) */}
                    <PostText text={post.text || post.caption || post.message} entities={post.entities} />

                    {/* Meta & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3 text-xs font-mono text-muted">
                        {post.date && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {new Date(post.date).toLocaleDateString("uz-UZ")}
                          </span>
                        )}
                        {post.channelUsername && (
                          <a href={`https://t.me/${post.channelUsername}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                            ✈️ @{post.channelUsername}
                          </a>
                        )}
                      </div>

                      {/* Reaction Bar with Picker */}
                      <ReactionBar post={post} onReact={handleReact} />
                    </div>

                    {/* Comment Section */}
                    <CommentSection post={post} />
                  </div>
                </AnimatedItem>
              ))}
            </div>
          )}
        </AnimatedSection>
      </div>
    </main>
  );
}
