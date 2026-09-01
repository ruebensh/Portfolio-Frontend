"use client";

import React, { useEffect, useRef } from "react";

interface ScrollSceneProps {
  height?: string;
  onProgress: (progress: number, rect?: any) => void;
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export const ScrollScene: React.FC<ScrollSceneProps> = ({
  height = "400vh",
  onProgress,
  children,
  className = "",
  id,
  style,
}) => {
  const sectionRef    = useRef<HTMLElement>(null);
  const tickingRef    = useRef(false);
  const onProgressRef = useRef(onProgress);

  // Cached layout metrics to prevent layout thrashing (reflows) during scroll
  const topRef        = useRef(0);
  const totalHRef     = useRef(0);
  const scrollableRef = useRef(1);

  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

  const updateMetrics = () => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    topRef.current = rect.top + scrollY;
    totalHRef.current = section.offsetHeight;
    scrollableRef.current = Math.max(1, totalHRef.current);
  };

  useEffect(() => {
    updateMetrics();

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const scrollY = window.scrollY || window.pageYOffset;
        const vh = window.innerHeight;
        const top = topRef.current;
        const totalH = totalHRef.current;

        const isInsideSection = scrollY + vh >= top && scrollY <= top + totalH;
        if (!isInsideSection) {
          tickingRef.current = false;
          return;
        }

        const relativeScroll = Math.max(0, scrollY - top);
        const progress = Math.min(1, Math.max(0, relativeScroll / scrollableRef.current));

        onProgressRef.current(progress);
        tickingRef.current = false;
      });
    };

    const handleResize = () => {
      updateMetrics();
      handleScroll();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section ref={sectionRef} id={id} className={`relative ${className}`} style={{ height }}>
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ willChange: "transform", transform: "translate3d(0,0,0)", ...style }}
      >
        {children}
      </div>
    </section>
  );
};
