import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, Minus, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMessageToAI } from '../services/aiService';

const ChatAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Assalomu alaykum! Men Jaloliddinning raqamli yordamchisiman. Sizga qanday yordam bera olaman?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Session ID mantiqi (Xotira individual bo'lishi uchun)
  const [sessionId] = useState(() => {
    let sId = localStorage.getItem('ruebensh_session_id');
    if (!sId) {
      sId = 'sid_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('ruebensh_session_id', sId);
    }
    return sId;
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const aiResponse = await sendMessageToAI(userMsg, sessionId);
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Kechirasiz, tarmoqda uzilish bo'ldi. Qayta urinib ko'ring." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 40, scale: 0.8, filter: 'blur(10px)' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="mb-5 w-[380px] sm:w-[420px] h-[600px] flex flex-col overflow-hidden rounded-[2.5rem] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-slate-900/80 backdrop-blur-2xl"
          >
            {/* Ambient Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              <div className="absolute -top-[10%] -left-[10%] w-40 h-40 bg-blue-600/20 rounded-full blur-[60px]" />
              <div className="absolute top-[20%] -right-[10%] w-40 h-40 bg-purple-600/20 rounded-full blur-[60px]" />
            </div>

            {/* Header */}
            <div className="relative z-10 p-5 border-b border-white/10 bg-white/5 backdrop-blur-md flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px]">
                    <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center backdrop-blur-xl">
                      <Sparkles size={22} className="text-blue-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-slate-900" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base tracking-tight">Rubensh AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Active Now</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.location.href = '/ai-chat'} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white" title="To'liq ekran">
                  <Maximize2 size={18} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-red-500/20 rounded-xl transition-colors text-slate-400 hover:text-red-400">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="relative z-10 flex-1 p-5 overflow-y-auto space-y-5 scrollbar-none">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`relative max-w-[85%] px-4 py-3 rounded-[1.5rem] text-[13.5px] leading-relaxed shadow-xl border ${
                      msg.role === 'user' 
                      ? 'bg-blue-600 border-blue-400/30 text-white rounded-tr-none' 
                      : 'bg-white/10 border-white/10 text-slate-100 rounded-tl-none backdrop-blur-md'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-[1.5rem] rounded-tl-none flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">Fikrlamoqdaman...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="relative z-10 p-5 bg-white/5 backdrop-blur-xl border-t border-white/10">
              <div className="relative flex items-center group">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Xabarni shu yerga yozing..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-white placeholder:text-slate-500"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2.5 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-30 disabled:shadow-none"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-center text-[9px] text-slate-500 mt-3 tracking-widest uppercase">
                Powered by Ruebensh Intelligence
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger Button */}
      <motion.button 
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-16 h-16 flex items-center justify-center rounded-[1.8rem] shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all duration-500 ${
          isOpen ? 'bg-slate-800 rotate-90' : 'bg-gradient-to-tr from-blue-600 to-indigo-700'
        }`}
      >
        <div className="absolute inset-0 rounded-[1.8rem] bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
        {isOpen ? <X size={30} className="text-white" /> : <MessageCircle size={30} className="text-white" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-4 border-[#020202] flex items-center justify-center text-[10px] font-bold text-white">
            1
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default ChatAI;