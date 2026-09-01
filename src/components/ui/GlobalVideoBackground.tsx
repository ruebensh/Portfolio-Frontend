"use client";

import { useEffect, useRef } from "react";

/**
 * GlobalVideoBackground
 * Fixed full-screen video that sits behind all page content.
 * Uses a dark overlay to keep text legible while the video plays.
 */
export const GlobalVideoBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = 0.7; // slow cinematic playback
    video.play().catch(() => {
      // Autoplay blocked — will play after first user interaction
      const unlock = () => {
        video.play().catch(() => {});
        window.removeEventListener("click", unlock);
        window.removeEventListener("touchstart", unlock);
      };
      window.addEventListener("click", unlock, { passive: true });
      window.addEventListener("touchstart", unlock, { passive: true });
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{ willChange: "transform" }}
    >
      <video
        ref={videoRef}
        src="/background.mp4"
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform: "translate3d(0,0,0)",
          backfaceVisibility: "hidden",
        }}
      />
      {/* Dark cinematic overlay — preserves readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,5,5,0.72) 0%, rgba(5,5,5,0.55) 50%, rgba(5,5,5,0.72) 100%)",
        }}
      />
    </div>
  );
};
