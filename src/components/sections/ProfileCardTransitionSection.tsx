"use client";

import React, { useRef, useCallback } from "react";
import { ScrollScene } from "@/components/core/ScrollScene";
import { ProfileCardContent } from "@/components/sections/ProfileCard";
import { easeInOutCubic } from "@/components/core/CardChoreography";

export const ProfileCardTransitionSection = ({ settings }: { settings: any }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const glowRef    = useRef<HTMLDivElement>(null);

  const handleProgress = useCallback((progress: number) => {
    const el = wrapperRef.current;
    if (!el) return;

    let opacity = 1;
    let translateY = 0;
    let translateZ = 0;
    let scale = 1;
    let rotateX = 0;
    let rotateY = 0;

    if (progress < 0.15) {
      // Static rest
    } else if (progress < 0.50) {
      const t = easeInOutCubic((progress - 0.15) / 0.35);
      translateY = t * -55;
      translateZ = t * 420;
      scale      = 1 + t * 0.18;
      rotateX    = t * 6;
      rotateY    = t * 3;
    } else {
      const t = easeInOutCubic(Math.min(1, (progress - 0.50) / 0.40));
      translateY = (1 - t) * -55;
      translateZ = (1 - t) * 420;
      scale      = 1 + (1 - t) * 0.18;
      rotateX    = (1 - t) * 6;
      rotateY    = (1 - t) * 3;
    }

    const glowT = progress > 0.50
      ? Math.max(0, 1 - (progress - 0.50) / 0.40)
      : progress > 0.15 ? (progress - 0.15) / 0.35 : 0;

    el.style.opacity    = Math.max(0, opacity).toString();
    el.style.transform  = `translate3d(0, ${translateY}px, ${translateZ}px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    el.style.boxShadow  = `0 ${15 + glowT * 35}px ${30 + glowT * 60}px -10px rgba(244, 201, 93, ${0.1 + glowT * 0.45}), 0 0 ${20 + glowT * 40}px rgba(244, 201, 93, ${glowT * 0.3})`;
    el.style.borderRadius = "24px";
    el.style.borderColor = `rgba(244, 201, 93, ${0.2 + glowT * 0.55})`;

    if (glowRef.current) {
      glowRef.current.style.opacity = (glowT * 0.8).toString();
    }
  }, []);

  return (
    <>
      {/* Desktop Animated Zoom (MD and up) */}
      <div className="hidden md:block">
        <ScrollScene
          id="profile"
          height="400vh"
          onProgress={handleProgress}
        >
          <div
            ref={glowRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              opacity: 0,
              background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(244,201,93,0.12), transparent 70%)",
              transition: "none",
            }}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent z-10"
          />

          <div
            className="absolute inset-0 z-20 flex items-center justify-center"
            style={{ perspective: "1200px", perspectiveOrigin: "50% 50%" }}
          >
            <div
              ref={wrapperRef}
              style={{ willChange: "transform, opacity" }}
            >
              <ProfileCardContent settings={settings} />
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 opacity-50">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted">Scroll</span>
            <div className="w-px h-7 bg-gradient-to-b from-muted/50 to-transparent" />
          </div>
        </ScrollScene>
      </div>

      {/* Mobile Sleek Static Profile Card (MD down) */}
      <section className="block md:hidden py-12 px-4 bg-transparent">
        <div className="max-w-md mx-auto flex justify-center">
          <ProfileCardContent settings={settings} />
        </div>
      </section>
    </>
  );
};
