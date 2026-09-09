"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ScrollScene } from "../core/ScrollScene";
import { FrameSequenceCanvas, FrameSequenceCanvasRef } from "../core/FrameSequenceCanvas";
import { FloatingSceneCard } from "../core/FloatingSceneCard";
import { interpolateKeyframes, ChoreoTimeline } from "../core/CardChoreography";
import { Button } from "@/components/ui/Button";
import { Heart, BookOpen, Code } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";

const FRAME_START = 1;
const FRAME_END = 300;
const FRAME_COUNT = FRAME_END - FRAME_START + 1;

// ── Timelines for the 3 distinct info cards with dramatic 3D X-Y-Z rotations & scale ──
const card1Timeline: ChoreoTimeline = {
  id: "card1",
  keyframes: [
    { progress: 0.10, opacity: 0, transform: { x: 550, y: 220,  z: -900, rx: 1.5, ry: 2.2, rz: 0.8, angle: -320, scale: 0.25 } },
    { progress: 0.26, opacity: 1, transform: { x: -180, y: -40, z: -20,  rx: 0.2, ry: 0.5, rz: 0.12, angle: 16,   scale: 1.25 } },
    { progress: 0.40, opacity: 1, transform: { x: -200, y: -60, z: 10,   rx: 0.2, ry: 0.5, rz: 0.12, angle: 22,   scale: 1.30 } },
    { progress: 0.54, opacity: 0, transform: { x: -750, y: -380, z: 500, rx: -1.2, ry: 2.8, rz: 1.2, angle: 360,  scale: 0.35 } },
  ],
};

const card2Timeline: ChoreoTimeline = {
  id: "card2",
  keyframes: [
    { progress: 0.36, opacity: 0, transform: { x: -550, y: -220, z: -900, rx: 2.2, ry: 1.5, rz: -0.8, angle: 320, scale: 0.25 } },
    { progress: 0.52, opacity: 1, transform: { x: 180,  y: 40,  z: -20,  rx: 0.5, ry: 0.2, rz: -0.12, angle: -16, scale: 1.25 } },
    { progress: 0.66, opacity: 1, transform: { x: 200,  y: 60,  z: 10,   rx: 0.5, ry: 0.2, rz: -0.12, angle: -22, scale: 1.30 } },
    { progress: 0.80, opacity: 0, transform: { x: 750,  y: 380, z: 500,  rx: 1.2, ry: -2.8, rz: -1.2, angle: -360, scale: 0.35 } },
  ],
};

const card3Timeline: ChoreoTimeline = {
  id: "card3",
  keyframes: [
    { progress: 0.60, opacity: 0, transform: { x: 0, y: 550,  z: -1000, rx: 2.5, ry: 1.8, rz: 1.5, angle: -360, scale: 0.25 } },
    { progress: 0.74, opacity: 1, transform: { x: 0, y: 0,    z: 0,     rx: 0.08, ry: 0.08, rz: 0.1, angle: 0,   scale: 1.30 } },
    { progress: 0.88, opacity: 1, transform: { x: 0, y: -20,  z: 20,    rx: 0.08, ry: 0.08, rz: 0.1, angle: 8,   scale: 1.35 } },
    { progress: 0.98, opacity: 0, transform: { x: 0, y: -650, z: 600,   rx: -1.8, ry: 2.5, rz: -1.8, angle: 420,  scale: 0.35 } },
  ],
};

export const Hero = ({ settings }: { settings?: any }) => {
  const { td } = useLanguage();
  const canvasRef    = useRef<FrameSequenceCanvasRef>(null);
  const introTextRef = useRef<HTMLDivElement>(null);
  const card1Ref     = useRef<HTMLDivElement>(null);
  const card2Ref     = useRef<HTMLDivElement>(null);
  const card3Ref     = useRef<HTMLDivElement>(null);

  const reducedRef = useRef(false);
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedRef.current = mq.matches;
    setIsReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => {
      reducedRef.current = e.matches;
      setIsReduced(e.matches);
    };
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const handleProgress = useCallback((progress: number, _rect: any) => {
    if (!reducedRef.current && canvasRef.current) {
      canvasRef.current.drawProgress(progress);
    }

    if (introTextRef.current) {
      const op = progress < 0.15 ? 1 - progress / 0.15 : 0;
      introTextRef.current.style.opacity = op.toString();
      introTextRef.current.style.transform = `translateY(${progress * -60}px)`;
      introTextRef.current.style.pointerEvents = op > 0.05 ? "auto" : "none";
    }

    if (reducedRef.current) return;

    if (window.innerWidth >= 768) {
      if (card1Ref.current) {
        const s = interpolateKeyframes(card1Timeline.keyframes, progress);
        card1Ref.current.style.opacity = s.opacity.toString();
        card1Ref.current.style.transform = s.transformString;
      }
      if (card2Ref.current) {
        const s = interpolateKeyframes(card2Timeline.keyframes, progress);
        card2Ref.current.style.opacity = s.opacity.toString();
        card2Ref.current.style.transform = s.transformString;
      }
      if (card3Ref.current) {
        const s = interpolateKeyframes(card3Timeline.keyframes, progress);
        card3Ref.current.style.opacity = s.opacity.toString();
        card3Ref.current.style.transform = s.transformString;
      }
    }
  }, []);

  return (
    <>
      {/* ── Desktop Cinematic 3D Canvas Hero (MD and up) ──────────────────── */}
      <div className="hidden md:block">
        <ScrollScene height="500vh" onProgress={handleProgress} id="hero-3d" style={{ backgroundColor: "#050505" }}>
          <div className="absolute inset-0 bg-[#050505] z-0" />

          {!isReduced ? (
            <FrameSequenceCanvas
              ref={canvasRef}
              frameCount={FRAME_COUNT}
              framePath={(i) => {
                const frameNumber = Math.min(FRAME_END, Math.max(FRAME_START, i));
                return `/frames/frame_${String(frameNumber).padStart(4, "0")}.jpg`;
              }}
              className="opacity-75 dark:opacity-65"
            />
          ) : (
            <div className="absolute inset-0 bg-[#050505]">
              <Image
                src="/frames/frame_0001.jpg"
                alt="Hero Poster"
                fill
                sizes="100vw"
                className="object-cover opacity-20"
                priority
              />
            </div>
          )}

          <div
            ref={introTextRef}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
            style={{ willChange: "transform, opacity" }}
          >
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-6 rounded-full border border-card-border bg-card-bg overflow-hidden shadow-[0_0_40px_rgba(244,201,93,0.15)]">
              <Image
                src={settings?.avatarUrl || "/jaloliddin_profile.png"}
                alt={settings?.name || settings?.author || ""}
                fill
                sizes="400px"
                className="object-cover"
                priority
              />
            </div>

            <span className="inline-flex items-center gap-2 border border-card-border bg-card-bg/80 px-4 py-1.5 font-mono text-[10px] tracking-widest text-accent backdrop-blur-md uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {td("Ruebensh")}
            </span>

            <h1 className="text-shimmer mx-auto mt-5 max-w-[18ch] font-display font-bold tracking-tighter leading-[1.06] text-4xl sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-lg">
              {td(settings?.author || settings?.title)}
            </h1>

            <p className="text-shimmer-accent mx-auto mt-4 font-mono tracking-widest uppercase font-semibold text-[11px] sm:text-sm drop-shadow">
              {td(settings?.mainStack)}
            </p>

            <p className="mx-auto mt-5 max-w-[48ch] text-sm sm:text-base leading-relaxed text-foreground/90 font-sans" style={{ textShadow: "0 1px 12px rgba(0,0,0,0.08)" }}>
              {td(settings?.description)}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-none">
              <Button href="https://t.me/jaloliddin_xalimov" showArrow className="w-full sm:w-auto">
                {td("Bog'lanish")}
              </Button>
              <Button href="/about" variant="secondary" className="w-full sm:w-auto">
                {td("Men Haqimda")}
              </Button>
            </div>

            <div className="absolute bottom-8 flex flex-col items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted">Scroll</span>
              <div className="w-px h-7 bg-gradient-to-b from-muted/50 to-transparent" />
            </div>
          </div>

          {!isReduced && (
            <div className="absolute inset-0 pointer-events-none" style={{ perspective: "1200px", perspectiveOrigin: "50% 50%" }}>
              <FloatingSceneCard ref={card1Ref} id="hero-card-values">
                <div className="card-surface p-8 md:p-9 border border-accent/40 bg-card-bg/85 backdrop-blur-2xl shadow-[0_30px_90px_-10px_rgba(244,201,93,0.45),0_0_40px_rgba(244,201,93,0.3)] rounded-3xl" style={{ width: "min(500px, 92vw)" }}>
                  <div className="flex items-center gap-3.5 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                      <Heart size={24} weight="fill" />
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">{td("Qadriyatlar & Tamoyillar")}</h3>
                  </div>
                  <ul className="space-y-3 font-sans text-sm md:text-base text-foreground/90 leading-relaxed font-medium">
                    <li className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(244,201,93,0.8)]" />
                      <span>{td("Doimiy o'rganish va amaliyot orqali yangi texnologiyalarni egallash")}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(244,201,93,0.8)]" />
                      <span>{td("Toza, o'qilishi oson va masshtablanuvchi kod yozish madaniyati")}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(244,201,93,0.8)]" />
                      <span>{td("Muammolarga innovatsion va AI yechimlar topish")}</span>
                    </li>
                  </ul>
                </div>
              </FloatingSceneCard>

              <FloatingSceneCard ref={card2Ref} id="hero-card-learning">
                <div className="card-surface p-8 md:p-9 border border-emerald-500/40 bg-card-bg/85 backdrop-blur-2xl shadow-[0_30px_90px_-10px_rgba(52,211,153,0.35),0_0_40px_rgba(244,201,93,0.25)] rounded-3xl" style={{ width: "min(490px, 92vw)" }}>
                  <div className="flex items-center gap-3.5 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <BookOpen size={24} weight="fill" />
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">{td("Hozir O'rganayotganlar")}</h3>
                  </div>
                  <ul className="space-y-3 font-sans text-sm md:text-base text-foreground/90 leading-relaxed font-medium">
                    <li className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span>Deep Learning & PyTorch Architecture</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span>Large Language Models (LLM) & RAG Systems</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span>High-Performance Async Backend Systems</span>
                    </li>
                  </ul>
                </div>
              </FloatingSceneCard>

              <FloatingSceneCard ref={card3Ref} id="hero-card-working">
                <div className="card-surface p-8 md:p-9 border border-indigo-500/40 bg-card-bg/85 backdrop-blur-2xl shadow-[0_30px_90px_-10px_rgba(129,140,248,0.35),0_0_40px_rgba(244,201,93,0.25)] rounded-3xl" style={{ width: "min(480px, 92vw)" }}>
                  <div className="flex items-center gap-3.5 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                      <Code size={24} weight="fill" />
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">{td("Hozir Ishlayotganlar")}</h3>
                  </div>
                  <ul className="space-y-3 font-sans text-sm text-foreground/90 leading-relaxed font-medium">
                    <li className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                      <span>AI Portfolio & Interactive Web Platform</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                      <span>Custom ML Pipeline & Data Analytics Tools</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                      <span>Rubensh AI Assistant Integration</span>
                    </li>
                  </ul>
                </div>
              </FloatingSceneCard>
            </div>
          )}
        </ScrollScene>
      </div>

      {/* ── Mobile Sleek & Minimal Hero (MD down) ─────────────────────────── */}
      <section className="block md:hidden pt-28 pb-12 px-5 bg-transparent text-center min-h-[90vh] flex flex-col justify-center items-center">
        {/* Avatar */}
        <div className="relative w-20 h-20 mb-5 rounded-full border-2 border-accent/40 bg-black/60 overflow-hidden shadow-[0_0_30px_rgba(244,201,93,0.25)]">
          <Image
            src={settings?.avatarUrl || "/jaloliddin_profile.png"}
            alt={settings?.name || settings?.author || ""}
            fill
            sizes="160px"
            className="object-cover"
            priority
          />
        </div>

        {/* Status badge */}
        <span className="inline-flex items-center gap-2 border border-accent/30 bg-accent/10 px-3.5 py-1 font-mono text-[9px] tracking-widest text-accent rounded-full uppercase mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {td("Ruebensh")}
        </span>

        {/* Name */}
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight mb-3">
          {td(settings?.author || settings?.title)}
        </h1>

        {/* Role */}
        <p className="font-mono text-xs text-accent font-semibold uppercase tracking-wider mb-4">
          {td(settings?.mainStack)}
        </p>

        {/* Description */}
        <p className="text-xs text-foreground/80 font-sans leading-relaxed max-w-sm mb-6">
          {td(settings?.description)}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full max-w-xs mb-8">
          <Button href="https://t.me/jaloliddin_xalimov" showArrow className="w-full">
            {td("Bog'lanish")}
          </Button>
          <Button href="/about" variant="secondary" className="w-full">
            {td("Men Haqimda")}
          </Button>
        </div>

        {/* Compact Values card on mobile */}
        <div className="w-full max-w-xs p-5 rounded-2xl border border-white/10 bg-[#0f0f1b]/90 backdrop-blur-xl text-left shadow-lg">
          <div className="flex items-center gap-2.5 mb-3">
            <Heart size={18} className="text-rose-400" weight="fill" />
            <h3 className="font-display text-xs font-bold text-white uppercase tracking-wider">{td("Qadriyatlar & Tamoyillar")}</h3>
          </div>
          <ul className="space-y-2 text-[11px] text-foreground/80 font-sans">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1 flex-shrink-0" />
              <span>{td("Doimiy o'rganish va amaliyot orqali yangi texnologiyalarni egallash")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1 flex-shrink-0" />
              <span>{td("Toza, o'qilishi oson va masshtablanuvchi kod yozish madaniyati")}</span>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
};
