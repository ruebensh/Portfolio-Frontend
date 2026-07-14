"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Trash2, Plus, Menu, X, MessageSquare, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendMessageToAI } from "../services/aiService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
}

export function AIChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Mount vaqtida Chat sessionlarni yuklash
  useEffect(() => {
    const localSessions = localStorage.getItem("ruebensh_chat_sessions");
    let sessionList: ChatSession[] = [];
    
    if (localSessions) {
      try {
        sessionList = JSON.parse(localSessions);
      } catch (e) {
        console.error("Failed to parse sessions:", e);
      }
    }

    if (sessionList.length === 0) {
      // Yangi session yaratish
      const newId = "sid_" + Math.random().toString(36).substring(2, 11);
      const defaultSession: ChatSession = {
        id: newId,
        title: "Yangi suhbat",
        createdAt: new Date().toISOString(),
      };
      sessionList = [defaultSession];
      localStorage.setItem("ruebensh_chat_sessions", JSON.stringify(sessionList));
    }

    setSessions(sessionList);

    // Faol sessionni tanlash
    const savedActiveId = localStorage.getItem("ruebensh_active_session_id");
    if (savedActiveId && sessionList.some(s => s.id === savedActiveId)) {
      setActiveSessionId(savedActiveId);
    } else {
      setActiveSessionId(sessionList[0].id);
      localStorage.setItem("ruebensh_active_session_id", sessionList[0].id);
    }
  }, []);

  // 2. Faol session o'zgarganda xabarlar tarixini yuklash
  useEffect(() => {
    if (!activeSessionId) return;

    localStorage.setItem("ruebensh_active_session_id", activeSessionId);

    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await fetch(`${API_URL}/ai/history/${activeSessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setMessages(data);
          } else {
            // Tarix bo'sh bo'lsa default xabar
            setMessages([
              {
                role: "ai",
                text: "Assalomu alaykum! Men Jaloliddinning raqamli yordamchisiman. Men bilan uning tajribasi, loyihalari yoki hayotiy qarashlari haqida suhbatlashishingiz mumkin.",
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [activeSessionId]);

  // 3. Scrollni har doim oxiriga tushirish
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading, historyLoading]);

  // Inputga fokus berish
  useEffect(() => {
    if (!isLoading && !historyLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading, historyLoading, activeSessionId]);

  // 4. Yangi suhbat yaratish
  const handleNewChat = () => {
    const newId = "sid_" + Math.random().toString(36).substring(2, 11);
    const newSession: ChatSession = {
      id: newId,
      title: "Yangi suhbat",
      createdAt: new Date().toISOString(),
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem("ruebensh_chat_sessions", JSON.stringify(updated));
    setActiveSessionId(newId);
    setIsSidebarOpen(false);
  };

  // 5. Suhbatni o'chirish (Database va LocalStorage-dan)
  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Ota element klikini to'xtatish
    
    // Serverdan o'chirish
    try {
      await fetch(`${API_URL}/ai/session/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete session remotely:", err);
    }

    const updated = sessions.filter(s => s.id !== id);
    
    if (updated.length === 0) {
      const newId = "sid_" + Math.random().toString(36).substring(2, 11);
      const defaultSession: ChatSession = {
        id: newId,
        title: "Yangi suhbat",
        createdAt: new Date().toISOString(),
      };
      setSessions([defaultSession]);
      localStorage.setItem("ruebensh_chat_sessions", JSON.stringify([defaultSession]));
      setActiveSessionId(newId);
    } else {
      setSessions(updated);
      localStorage.setItem("ruebensh_chat_sessions", JSON.stringify(updated));
      if (activeSessionId === id) {
        setActiveSessionId(updated[0].id);
      }
    }
  };

  // 6. Xabar jo'natish
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || historyLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    // Agar bu birinchi xabar bo'lsa va mavzu hali "Yangi suhbat" bo'lsa, nomni yangilaymiz
    const currentSession = sessions.find(s => s.id === activeSessionId);
    if (currentSession && currentSession.title === "Yangi suhbat") {
      const newTitle = userMsg.length > 28 ? userMsg.substring(0, 25) + "..." : userMsg;
      const updatedSessions = sessions.map(s => 
        s.id === activeSessionId ? { ...s, title: newTitle } : s
      );
      setSessions(updatedSessions);
      localStorage.setItem("ruebensh_chat_sessions", JSON.stringify(updatedSessions));
    }

    try {
      const res = await sendMessageToAI(userMsg, activeSessionId);
      setMessages((prev) => [...prev, { role: "ai", text: res }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Xatolik yuz berdi..." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        .ai-chat-container {
          display: flex;
          height: calc(100vh - 64px);
          background: linear-gradient(135deg, #000000 0%, #0d0d1e 50%, #150a22 100%);
          overflow: hidden;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .chat-sidebar {
          width: 280px;
          background: rgba(10, 10, 20, 0.7);
          backdrop-filter: blur(25px);
          border-right: 1px solid rgba(120, 100, 255, 0.12);
          display: flex;
          flex-direction: column;
          z-index: 40;
          transition: transform 0.3s ease;
        }

        @media (max-width: 768px) {
          .chat-sidebar {
            position: absolute;
            left: 0;
            top: 64px;
            bottom: 0;
            transform: translateX(-100%);
            width: 260px;
            background: rgba(10, 10, 20, 0.95);
          }
          .chat-sidebar.open {
            transform: translateX(0);
          }
        }

        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
          z-index: 10;
        }

        .session-item {
          padding: 0.85rem 1rem;
          margin: 0.25rem 0.5rem;
          border-radius: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: rgba(255, 255, 255, 0.65);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .session-item:hover {
          background: rgba(120, 100, 255, 0.08);
          color: white;
        }

        .session-item.active {
          background: rgba(120, 100, 255, 0.16);
          border-color: rgba(120, 100, 255, 0.25);
          color: white;
          box-shadow: 0 4px 20px rgba(120, 100, 255, 0.1);
        }

        .delete-btn {
          opacity: 0;
          transition: opacity 0.2s ease;
          color: rgba(255, 255, 255, 0.4);
        }

        .session-item:hover .delete-btn {
          opacity: 1;
        }

        .delete-btn:hover {
          color: #ef4444;
        }

        .message-box {
          max-w-[78%] px-4 py-3.5 rounded-2xl text-[14px] leading-relaxed shadow-lg;
        }

        .message-ai {
          background: rgba(80, 70, 220, 0.18);
          border: 1px solid rgba(140, 120, 255, 0.25);
          box-shadow: 0 4px 24px rgba(140, 120, 255, 0.08);
        }

        .message-user {
          background: rgba(60, 130, 240, 0.22);
          border: 1px solid rgba(100, 180, 255, 0.28);
          box-shadow: 0 4px 24px rgba(100, 180, 255, 0.1);
        }

        .new-chat-btn {
          background: linear-gradient(135deg, rgba(80, 70, 220, 0.3) 0%, rgba(140, 120, 255, 0.3) 100%);
          border: 1px solid rgba(120, 100, 255, 0.35);
          transition: all 0.3s ease;
        }

        .new-chat-btn:hover {
          box-shadow: 0 0 20px rgba(120, 100, 255, 0.45);
          border-color: rgba(120, 100, 255, 0.6);
          transform: translateY(-1px);
        }
      `}</style>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="ai-chat-container">
        {/* SIDEBAR */}
        <aside className={`chat-sidebar ${isSidebarOpen ? "open" : ""}`}>
          <div className="p-4 border-b border-white/5 flex flex-col gap-3">
            <button
              onClick={handleNewChat}
              className="new-chat-btn flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-md"
            >
              <Plus size={16} />
              Yangi suhbat
            </button>
          </div>

          {/* Sessionlar ro'yxati */}
          <div className="flex-1 overflow-y-auto py-3 space-y-0.5 scrollbar-thin scrollbar-thumb-white/5">
            <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Yaqindagi suhbatlar
            </div>
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                  setIsSidebarOpen(false);
                }}
                className={`session-item ${session.id === activeSessionId ? "active" : ""}`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MessageSquare size={15} className={session.id === activeSessionId ? "text-indigo-400" : "text-slate-500"} />
                  <span className="truncate pr-1 text-slate-200">{session.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(session.id, e)}
                  className="delete-btn p-1 rounded hover:bg-white/5"
                  title="O'chirish"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/5 text-[11px] text-slate-500 text-center">
            Muloqotlar 30 kungacha saqlanadi
          </div>
        </aside>

        {/* CHAT MAIN WORKSPACE */}
        <main className="chat-main">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between px-4 py-3.5 bg-black/40 backdrop-blur-md border-b border-white/5">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-semibold text-white truncate max-w-[200px]">
              {sessions.find(s => s.id === activeSessionId)?.title || "AI Chatbot"}
            </h1>
            <button
              onClick={handleNewChat}
              className="p-2 -mr-2 rounded-lg text-slate-300 hover:text-indigo-400 hover:bg-white/5"
              title="Yangi suhbat"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between px-6 py-4 bg-black/10 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-400/25 flex items-center justify-center">
                <Sparkles className="text-indigo-400 animate-pulse" size={18} />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-wide">
                  {sessions.find(s => s.id === activeSessionId)?.title || "Yangi suhbat"}
                </h1>
                <div className="text-[10px] text-emerald-400 font-medium">Individual suhbat xonasi</div>
              </div>
            </div>
          </div>

          {/* Xabarlar ro'yxati */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5 scrollbar-thin scrollbar-thumb-white/5"
          >
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-indigo-400 gap-3">
                <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold tracking-wide">Suhbat tarixi yuklanmoqda...</span>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role !== "user" && (
                      <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border border-purple-400/25 flex items-center justify-center mr-3.5 flex-shrink-0">
                        <Bot size={16} className="text-purple-300" />
                      </div>
                    )}

                    <div
                      className={`message-box max-w-[82%] md:max-w-[72%] px-4.5 py-3 rounded-2xl text-sm leading-relaxed border ${
                        msg.role === "user"
                          ? "message-user rounded-tr-none text-white"
                          : "message-ai rounded-tl-none text-slate-100"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {msg.role === "user" && (
                      <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-cyan-600/30 to-blue-700/30 border border-cyan-400/25 flex items-center justify-center ml-3.5 flex-shrink-0">
                        <User size={16} className="text-cyan-300" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {isLoading && (
              <div className="flex items-center gap-3 pl-12 text-indigo-400">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                </div>
                <span className="text-xs font-semibold">yozmoqda...</span>
              </div>
            )}
          </div>

          {/* Kiritish qismi (Sticky Bottom) */}
          <form
            onSubmit={handleSend}
            className="border-t border-white/5 bg-black/10 backdrop-blur-md px-4 md:px-8 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          >
            <div className="relative max-w-4xl mx-auto w-full">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={historyLoading ? "Tarix yuklanmoqda..." : "Yozish uchun bu yerga bosing..."}
                disabled={isLoading || historyLoading}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4.5 pl-6 pr-16 text-sm placeholder:text-slate-500 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/10 text-white"
              />
              <button
                type="submit"
                disabled={isLoading || historyLoading || !input.trim()}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl disabled:opacity-30 disabled:pointer-events-none hover:brightness-110 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                aria-label="Yuborish"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}
