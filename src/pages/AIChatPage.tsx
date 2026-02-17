import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendMessageToAI } from "../services/aiService";

export function AIChatPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Assalomu alaykum! Men Jaloliddinning raqamli egizagiman. Men bilan uning tajribasi, loyihalari yoki hayotiy qarashlari haqida suhbatlashishingiz mumkin." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- SESSION ID MANTIQI ---
  const [sessionId] = useState(() => {
    let sId = localStorage.getItem('ruebensh_session_id');
    if (!sId) {
      sId = 'sid_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('ruebensh_session_id', sId);
    }
    return sId;
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    // Endi sessionId ham yuboriladi
    const response = await sendMessageToAI(userMsg, sessionId);
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([messages[0]]);
    // Agar xohlasangiz xotirani backendda ham tozalash uchun alohida route ochish mumkin
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#020202] text-white p-4 md:p-8 flex flex-col items-center justify-center">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-2xl flex flex-col h-[75vh] shadow-2xl overflow-hidden z-10"
      >
        {/* Chat Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <Bot className="text-primary" size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Ruebensh AI Assistant</h1>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Online | Individual Session
              </p>
            </div>
          </div>
          <button 
            onClick={clearChat}
            className="p-2.5 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
            title="Suhbatni tozalash"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* Messages Container */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                  msg.role === 'user' ? 'bg-primary border-primary/30' : 'bg-white/5 border-white/10'
                }`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                  msg.role === 'user' 
                  ? 'bg-primary/20 border border-primary/30 text-white rounded-tr-none' 
                  : 'bg-white/[0.07] border border-white/10 text-gray-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-4 items-center animate-pulse text-muted-foreground">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Loader2 size={20} className="animate-spin text-primary" />
              </div>
              <p className="text-xs tracking-widest italic font-light">Rubensh o'ylamoqda...</p>
            </div>
          )}
        </div>

        {/* Input Field */}
        <form onSubmit={handleSend} className="p-6 border-t border-white/10 bg-white/[0.01]">
          <div className="relative flex items-center max-w-3xl mx-auto">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Savolingizni yozing..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-16 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm placeholder:text-white/20"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-3 bg-primary text-primary-foreground rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}