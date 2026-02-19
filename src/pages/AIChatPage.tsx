"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendMessageToAI } from "../services/aiService";

export function AIChatPage() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: "Assalomu alaykum! Men Jaloliddinning raqamli yordamchisiman. Men bilan uning tajribasi, loyihalari yoki hayotiy qarashlari haqida suhbatlashishingiz mumkin.",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [sessionId] = useState(() => {
    const existing = localStorage.getItem("ruebensh_session_id");
    if (existing) return existing;
    const newId = "sid_" + Math.random().toString(36).substring(2, 11);
    localStorage.setItem("ruebensh_session_id", newId);
    return newId;
  });

  useEffect(() => {
    if (!isLoading) {
      const id = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);

      return () => clearTimeout(id);
    }
  }, [isLoading]);

  // Scrollni pastga tushirish (message ko‘payganda)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await sendMessageToAI(userMsg, sessionId);
      setMessages((prev) => [...prev, { role: "ai", text: res }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Xatolik yuz berdi..." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => setMessages([messages[0]]);

  return (
    <>
      <style jsx global>{`
        .ai-chat-page {
          background: linear-gradient(135deg, #000000 0%, #111111 50%, #1a1a1a 100%);
          min-height: calc(100vh - 64px);
          position: relative;
          overflow: hidden;
        }
        .floating-bg {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.22;
          pointer-events: none;
          z-index: 0;
        }
        .blur-1 {
          background: #4f46e5;
          top: -15%;
          left: -10%;
          width: 50%;
          height: 60%;
          animation: drift 32s infinite ease-in-out;
        }
        .blur-2 {
          background: #7c3aed;
          bottom: -20%;
          right: -15%;
          width: 60%;
          height: 70%;
          animation: drift 38s infinite ease-in-out reverse;
        }
        @keyframes drift {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(80px, -100px) rotate(4deg);
          }
        }

        .chat-card {
          background: rgba(15, 15, 45, 0.45);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(120, 100, 255, 0.22);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
          border-radius: 1.5rem;
          overflow: hidden;
          height: min(82vh, 1000px);
          max-width: 960px;
          width: 100%;
          z-index: 0;
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 640px) {
          .chat-card {
            height: calc(100vh - 96px);
            border-radius: 1.25rem;
          }
        }

        ::-webkit-scrollbar {
          width: 1px;
          overflow: hidden;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgb(255, 255, 255);
          border-radius: 10px;
        }
        
        .message-ai {
          background: rgba(80, 70, 220, 0.24);
          border: 1px solid rgba(140, 120, 255, 0.32);1
          box-shadow: 0 4px 24px rgba(140, 120, 255, 0.18);
        }
        .message-user {
          background: rgba(60, 130, 240, 0.28);
          border: 1px solid rgba(100, 180, 255, 0.38);
          box-shadow: 0 4px 24px rgba(100, 180, 255, 0.22);
        }
        .glow-hover:hover {
          box-shadow: 0 0 32px rgba(140, 120, 255, 0.45) !important;
          transform: translateY(-1px);
          transition: all 0.25s ease;
        }
          
          .chat-messages::-webkit-scrollbar-track {
            background: transparent;
          }
          .chat-messages::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
      `}</style>

      <div className="ai-chat-page flex items-center justify-center p-3 sm:p-4 md:p-6">
        {/* Fon blur doiralari */}
        <div className="floating-bg blur-1" />
        <div className="floating-bg blur-2" />

        <div className="chat-card">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/8 bg-black/25 backdrop-blur-lg">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600/40 to-purple-700/40 border border-indigo-400/35 flex items-center justify-center shadow-md">
                <Bot className="text-indigo-300" size={22} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">Rubensh AI</h1>
                <div className="flex items-center gap-2 text-xs text-cyan-200/80">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
                    <span className="relative rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  Online • Individual Session
                </div>
              </div>
            </div>

            <button
              onClick={clearChat}
              className="p-2 rounded-lg hover:bg-red-900/40 text-red-300 transition-colors"
              aria-label="Clear chat"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {/* Messages – faqat shu qism scroll qiladi */}
          <div
            ref={scrollRef} 
            id="chat-messages"

            className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 scrollbar-thin scrollbar-thumb-indigo-500/40 scrollbar-track-transparent"
            style={{ overflowY: "auto", }}
          >
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role !== "user" && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600/35 to-indigo-600/35 border border-purple-400/30 flex items-center justify-center mr-3 flex-shrink-0">
                      <Bot size={18} className="text-purple-300" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed glow-hover ${
                      msg.role === "user" ? "message-user rounded-br-none" : "message-ai rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600/35 to-blue-700/35 border border-cyan-400/30 flex items-center justify-center ml-3 flex-shrink-0">
                      <User size={18} className="text-cyan-200" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex items-center gap-3 pl-12 text-indigo-300/80">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" />
                </div>
                <span>o‘ylamoqda...</span>
              </div>
            )}
          </div>

          {/* Input – sticky bottom, responsiv */}
          <form
            onSubmit={handleSend}
            className="sticky bottom-0 border-t border-white/10 bg-black/35 backdrop-blur-lg px-4 sm:px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <div className="relative max-w-4xl mx-auto w-full">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Xabaringizni yozing..."
                disabled={isLoading}
                className="w-full bg-white/7 border border-white/15 rounded-2xl py-4 pl-5 sm:pl-6 pr-16 sm:pr-16 text-sm placeholder:text-white/45 outline-none transition-all focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-3 sm:right-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl disabled:opacity-50 hover:brightness-110 transition-all shadow-md"
                aria-label="Send"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
