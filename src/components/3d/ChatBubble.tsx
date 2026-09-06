"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTourGuide } from "@/context/TourGuideContext";
import { Robot } from "@phosphor-icons/react/dist/ssr";

export default function ChatBubble() {
  const { activeTarget } = useTourGuide();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (activeTarget?.title) {
      // Simulate AI typing delay for now (this is where AI stream will go)
      setIsTyping(true);
      setMessage("");
      
      const timeout = setTimeout(() => {
        setIsTyping(false);
        setMessage(`Men "${activeTarget.title}" haqida o'ylayapman. Juda qiziqarli loyiha!`);
      }, 2000);
      
      return () => clearTimeout(timeout);
    } else {
      setMessage("");
    }
  }, [activeTarget]);

  return (
    <AnimatePresence>
      {(message || isTyping) && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          className="fixed bottom-10 right-10 z-[60] max-w-sm rounded-2xl border border-white/10 bg-black/60 p-5 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-2 flex items-center gap-2 text-indigo-400">
            <Robot weight="duotone" size={24} />
            <span className="text-sm font-semibold tracking-wider">AI GID</span>
          </div>
          
          <div className="text-base leading-relaxed text-gray-200">
            {isTyping ? (
              <span className="flex items-center gap-1">
                O'ylayapman <span className="animate-pulse">...</span>
              </span>
            ) : (
              message
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
