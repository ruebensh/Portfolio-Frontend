"use client";

import React, { useState, useEffect, useRef } from "react";

// Global singleton Audio instance to prevent re-creation or audio restart on route navigation
let globalAudio: HTMLAudioElement | null = null;
let globalAudioCtx: AudioContext | null = null;

export const BackgroundMusicPlayer = () => {
  // Always start with false (server default) — sync from localStorage in useEffect
  // This prevents SSR hydration mismatch (server never has window/localStorage)
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Retrieve or create singleton audio
    if (!globalAudio) {
      const audio = new Audio("/background.mp3");
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0.32;
      globalAudio = audio;
    }

    audioRef.current = globalAudio;
    const audio = globalAudio;

    // Sync saved preference with audio element
    const savedPref = localStorage.getItem("devini_bg_music_muted");
    const userWantsMute = savedPref === "true";

    audio.muted = userWantsMute;
    setIsMuted(userWantsMute);

    // Function to attempt playback and unlock AudioContext
    const playAudio = () => {
      if (audio.muted) return;

      if (!globalAudioCtx) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          globalAudioCtx = new AudioCtxClass();
        }
      }
      if (globalAudioCtx && globalAudioCtx.state === "suspended") {
        globalAudioCtx.resume().catch(() => {});
      }

      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    };

    if (!userWantsMute) {
      playAudio();
    }

    // Attach gesture listeners so ANY interaction on page immediately starts playback if autoplay was blocked
    const gestureEvents = [
      "click",
      "touchstart",
      "pointerdown",
      "mousedown",
      "keydown",
      "scroll",
      "mousemove",
    ];

    const handleUserGesture = () => {
      const isCurrentlyMuted = localStorage.getItem("devini_bg_music_muted") === "true";
      if (!isCurrentlyMuted && audio.paused) {
        playAudio();
      }
    };

    gestureEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserGesture, { passive: true });
    });

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      gestureEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserGesture);
      });
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current || globalAudio;
    if (!audio) return;

    if (!isMuted) {
      // User clicks to MUTE / TURN OFF
      audio.muted = true;
      audio.pause();
      setIsMuted(true);
      setIsPlaying(false);
      localStorage.setItem("devini_bg_music_muted", "true");
    } else {
      // User clicks to UNMUTE / TURN ON
      audio.muted = false;
      setIsMuted(false);
      localStorage.setItem("devini_bg_music_muted", "false");

      if (globalAudioCtx && globalAudioCtx.state === "suspended") {
        globalAudioCtx.resume().catch(() => {});
      }

      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  return (
    <button
      onClick={togglePlay}
      aria-label={!isMuted ? "Musiqani o'chirish" : "Musiqani yoqish"}
      title={!isMuted ? "Musiqa: Yoqilgan (Chertib o'chirish)" : "Musiqa: O'chirilgan (Chertib yoqish)"}
      className={`h-9 px-2.5 rounded-full border transition-all duration-200 flex items-center justify-center gap-1.5 ${
        !isMuted
          ? "border-accent/60 bg-accent/15 text-accent shadow-[0_0_12px_rgba(244,201,93,0.3)]"
          : "border-card-border bg-card-bg/50 text-muted hover:border-accent hover:text-accent"
      }`}
    >
      <span className="text-xs select-none">
        {!isMuted ? "🎵" : "🔇"}
      </span>

      {!isMuted && (
        <span className="hidden sm:flex items-end justify-center gap-[1.5px] w-3 h-2.5">
          <span className={`w-[1.5px] bg-accent rounded-full ${isPlaying ? "animate-[bounce_1.2s_infinite_100ms] h-full" : "h-2"}`} />
          <span className={`w-[1.5px] bg-accent rounded-full ${isPlaying ? "animate-[bounce_1.2s_infinite_300ms] h-2/3" : "h-3"}`} />
          <span className={`w-[1.5px] bg-accent rounded-full ${isPlaying ? "animate-[bounce_1.2s_infinite_200ms] h-full" : "h-1.5"}`} />
        </span>
      )}
    </button>
  );
};
