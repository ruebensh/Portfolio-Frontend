"use client";

import { useEffect, useState } from "react";

export const MobileScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0) {
        setProgress(Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="block md:hidden fixed top-0 left-0 right-0 h-[2.5px] z-[120] pointer-events-none bg-white/5"
    >
      <div
        className="h-full transition-[width] duration-75 ease-out"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #7c3aed 0%, #a855f7 50%, #f4c95d 100%)",
          boxShadow: progress > 1 ? "0 0 8px rgba(244,201,93,0.8), 0 0 16px rgba(168,85,247,0.5)" : "none",
        }}
      />
    </div>
  );
};
