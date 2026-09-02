"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendAIChatMessage, getAIHistory, deleteAISession } from "@/lib/api";
import { Plus, List, X, Trash, PaperPlaneRight, User, Robot } from "@phosphor-icons/react/dist/ssr";

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
}

const STORAGE_KEY = "devini_chat_sessions";
const ACTIVE_KEY = "devini_active_session";

export default function AIChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let list: ChatSession[] = [];
    try { list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch {}
    if (!list.length) {
      const s = newSession();
      list = [s];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
    setSessions(list);
    const savedId = localStorage.getItem(ACTIVE_KEY);
    const id = (savedId && list.some(s => s.id === savedId)) ? savedId : list[0].id;
    setActiveSessionId(id);
  }, []);

  useEffect(() => {
    if (!activeSessionId) return;
    localStorage.setItem(ACTIVE_KEY, activeSessionId);
    setHistoryLoading(true);
    getAIHistory(activeSessionId).then((data) => {
      if (data?.length) {
        setMessages(data);
      } else {
        setMessages([{ role: "ai", text: "Assalomu alaykum! Men Jaloliddinning raqamli yordamchisiman. Uning tajribasi, loyihalari yoki ko'nikmalari haqida so'rasangiz javob beraman." }]);
      }
    }).finally(() => setHistoryLoading(false));
  }, [activeSessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, historyLoading]);

  function newSession(): ChatSession {
    return { id: "sid_" + Math.random().toString(36).slice(2, 11), title: "Yangi suhbat", createdAt: new Date().toISOString() };
  }

  const handleNewChat = () => {
    const s = newSession();
    const updated = [s, ...sessions];
    setSessions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setActiveSessionId(s.id);
    setSidebarOpen(false);
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteAISession(id);
    let updated = sessions.filter(s => s.id !== id);
    if (!updated.length) {
      const s = newSession();
      updated = [s];
    }
    setSessions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (activeSessionId === id) setActiveSessionId(updated[0].id);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading || historyLoading) return;
    const text = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "52px";

    const currentSession = sessions.find(s => s.id === activeSessionId);
    if (currentSession?.title === "Yangi suhbat") {
      const title = text.length > 28 ? text.slice(0, 25) + "..." : text;
      const updated = sessions.map(s => s.id === activeSessionId ? { ...s, title } : s);
      setSessions(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    setMessages(prev => [...prev, { role: "user", text }]);
    setLoading(true);
    const res = await sendAIChatMessage(text, activeSessionId);
    setMessages(prev => [...prev, { role: "ai", text: res }]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSend(); }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "52px";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-card-bg backdrop-blur-2xl">
      <div className="p-4 border-b border-card-border">
        <button onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} weight="bold" /> Yangi suhbat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.map((s) => (
          <div key={s.id} onClick={() => { setActiveSessionId(s.id); setSidebarOpen(false); }}
            className={`w-full cursor-pointer text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between group ${s.id === activeSessionId ? "card-surface-nested text-accent font-medium border-accent/40" : "text-foreground/80 hover:bg-white/5"}`}>
            <span className="truncate max-w-[160px]">{s.title}</span>
            <button onClick={(e) => handleDeleteSession(s.id, e)}
              className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-all p-1 rounded-lg">
              <Trash size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen pt-16 bg-card-bg/75 backdrop-blur-2xl">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-72 card-surface border-r border-card-border h-full flex-shrink-0 rounded-none border-t-0 border-b-0 border-l-0">
        <div className="p-4 border-b border-card-border">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <span className="text-lg">✨</span> Ruebensh AI
          </h2>
        </div>
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden flex">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              className="relative z-10 w-72 card-surface h-full flex flex-col rounded-none">
              <div className="p-4 border-b border-card-border flex items-center justify-between">
                <h2 className="font-bold text-foreground">✨ Ruebensh AI</h2>
                <button onClick={() => setSidebarOpen(false)} className="text-muted hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <Sidebar />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="h-14 border-b border-card-border bg-card-bg/60 backdrop-blur-xl flex items-center px-4 gap-3">
          <button className="md:hidden text-foreground/80 hover:text-foreground" onClick={() => setSidebarOpen(true)}>
            <List size={22} />
          </button>
          <span className="font-medium text-foreground truncate">
            {sessions.find(s => s.id === activeSessionId)?.title || "Yangi suhbat"}
          </span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {historyLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-accent/20 text-accent border border-accent/30" : "card-surface-nested text-muted"}`}>
                    {msg.role === "user" ? <User size={18} weight="fill" /> : <Robot size={18} weight="fill" />}
                  </div>
                  <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-accent text-accent-foreground rounded-tr-sm font-medium" : "bg-[#0e0e18]/85 backdrop-blur-xl text-foreground rounded-tl-sm border border-white/15 shadow-md"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full card-surface-nested flex items-center justify-center">
                    <Robot size={18} weight="fill" className="text-accent" />
                  </div>
                  <div className="card-surface-nested border border-card-border shadow-sm px-5 py-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                    {[0, 0.15, 0.3].map((d, i) => (
                      <span key={i} className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${d}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-card-border bg-card-bg/60 backdrop-blur-xl">
          <form onSubmit={handleSend} className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={autoResize}
              onKeyDown={handleKeyDown}
              placeholder="Xabaringizni yozing... (Ctrl+Enter yuborish)"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-card-border card-surface-nested text-foreground px-4 py-3.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all min-h-[52px] max-h-[160px]"
              style={{ height: "52px" }}
            />
            <button type="submit" disabled={!input.trim() || loading}
              className="w-12 h-12 rounded-xl bg-accent text-accent-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex-shrink-0">
              <PaperPlaneRight size={20} weight="fill" />
            </button>
          </form>
          <p className="text-xs text-muted mt-2 text-center">Ctrl+Enter — yuborish</p>
        </div>
      </div>
    </div>
  );
}
