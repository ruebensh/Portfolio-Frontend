"use client";

import { useEffect, useRef } from "react";

interface RoundCarouselItem {
  id?: string;
  src: string;
  title?: string;
  category?: string;
  description?: string;
  status?: string;
  [key: string]: any;
}

interface RoundCarouselProps {
  items?: RoundCarouselItem[];
  imageWidth?: number;
  imageHeight?: number;
  spacing?: number;
  speed?: number;
  direction?: "right" | "left";
  drag?: boolean;
  sensitivity?: number;
  tilt?: number;
  perspective?: number;
  cornerRadius?: number;
  innerDim?: number;
  background?: string;
  style?: React.CSSProperties;
  onSelect?: (item: RoundCarouselItem) => void;
}

const DEFAULT_ITEMS: RoundCarouselItem[] = [
  { id: "p1", src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/e60dd7f7-a44f-40a7-df62-095b19cd8700/w=800", title: "Project One", category: "AI/ML" },
  { id: "p2", src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/eec164e9-23f8-4f87-b48a-a208fa806100/w=800", title: "Project Two", category: "Web" },
  { id: "p3", src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/859c75ea-953e-489e-be61-91a03a35d700/w=800", title: "Project Three", category: "Platform" },
  { id: "p4", src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/933a7615-f4b6-4eae-8ed1-705fa0e24400/w=800", title: "Project Four", category: "Data" },
  { id: "p5", src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/7d4d2641-d6a8-4fef-e85c-b12ed100d500/w=800", title: "Project Five", category: "AI" },
  { id: "p6", src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/ed7b1c40-3332-43d8-a9eb-4615ef341b00/w=800", title: "Project Six", category: "Backend" },
  { id: "p7", src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/31afae9c-5ba3-4ec3-2534-ed8198ed1100/w=800", title: "Project Seven", category: "Automation" },
  { id: "p8", src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/bd541261-75be-469c-7dc0-dae0ce81c400/w=800", title: "Project Eight", category: "Vision" },
];

export default function RoundCarousel({
  items = DEFAULT_ITEMS,
  imageWidth = 240,
  imageHeight = 300,
  spacing = 3,
  speed = 7,
  direction = "right",
  drag = true,
  sensitivity = 5,
  tilt = -8,
  perspective = 2200,
  cornerRadius = 24,
  innerDim = 3.8,
  background = "#0b0b12",
  style = {},
  onSelect,
}: RoundCarouselProps) {
  const carouselItems = items.length > 0 ? items : DEFAULT_ITEMS;
  const count = carouselItems.length;

  const ringRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const rotYRef = useRef(0);
  const velRef = useRef(0);
  const lastRef = useRef(0);
  const dragRef = useRef({ active: false, x: 0 });

  const angle = 360 / count;
  const factor = 1 + spacing * 0.18;
  const radius = (imageWidth * factor) / (2 * Math.tan(Math.PI / count));
  const radiusPx = cornerRadius;
  const baseSpeed = Math.max(0.5, speed);
  const degPerSec = baseSpeed * 7 * (direction === "left" ? -1 : 1);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;

    const apply = () => {
      ring.style.transform = `translateZ(${-radius}px) rotateY(${rotYRef.current}deg)`;
      ring.style.willChange = "transform";
    };

    apply();

    const draw = (now: number) => {
      const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
      lastRef.current = now;
      const f = Math.min(Math.max(dt, 0.016), 0.033);
      const d = dragRef.current;

      if (!d.active) {
        if (Math.abs(velRef.current) > 0.01) {
          rotYRef.current += velRef.current * f;
          velRef.current *= 0.94;
        } else {
          rotYRef.current += degPerSec * f;
        }
      }

      apply();
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [radius, degPerSec, count]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!drag) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { active: true, x: e.clientX };
    velRef.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.x;
    d.x = e.clientX;
    const k = 0.3 * sensitivity;
    rotYRef.current += dx * k;
    velRef.current = dx * k * 60;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    dragRef.current.active = false;
  };

  const faceBase: React.CSSProperties = {
    position: "absolute",
    width: imageWidth,
    height: imageHeight,
    borderRadius: radiusPx,
    overflow: "hidden",
    backfaceVisibility: "visible",
    WebkitBackfaceVisibility: "visible",
    backgroundColor: "#101018",
    boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.14)",
  };

  return (
    <div
      style={{
        ...style,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background,
        perspective: `${perspective}px`,
        cursor: drag ? "grab" : "default",
        touchAction: "none",
        userSelect: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt}deg)`,
        }}
      >
        <div
          ref={ringRef}
          style={{
            position: "relative",
            width: imageWidth,
            height: imageHeight,
            transformStyle: "preserve-3d",
          }}
        >
          {carouselItems.map((item, i) => {
            const src = item?.src;
            const normalized = ((i * angle + rotYRef.current) % 360 + 360) % 360;
            const distanceToFront = Math.min(normalized, 360 - normalized);
            const isFront = distanceToFront < angle * 0.7;
            const scale = isFront ? 1.08 : 0.96;
            const lift = isFront ? -10 : 2;
            const opacity = isFront ? 1 : Math.max(0.72, 1 - distanceToFront / 180);

            return (
              <button
                key={item.id || i}
                type="button"
                onClick={() => onSelect?.(item)}
                style={{
                  ...faceBase,
                  transform: `rotateY(${i * angle}deg) translateZ(${radius + (isFront ? 18 : 0)}px) scale(${scale}) translateY(${lift}px)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  justifyContent: "flex-start",
                  padding: 0,
                  cursor: "pointer",
                  background: "rgba(12,12,18,0.9)",
                  opacity,
                  filter: isFront ? "drop-shadow(0 28px 36px rgba(90, 110, 255, 0.18))" : "none",
                  zIndex: isFront ? 20 : 1,
                  borderColor: isFront ? "rgba(170, 215, 255, 0.35)" : "rgba(255,255,255,0.14)",
                }}
              >
                <div className="relative w-full h-[220px] overflow-hidden rounded-t-[inherit] border-b border-white/10 bg-black/60">
                  <img
                    src={src}
                    alt={item.title || `Project ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col gap-2 p-3 text-left bg-[#0d0d12]/95">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent">
                      {item.category || "Project"}
                    </span>
                    {item.status && (
                      <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                        {item.status}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-[1.05rem] font-bold text-white leading-tight line-clamp-2">
                    {item.title || `Project ${i + 1}`}
                  </h3>
                  {item.description && (
                    <p className="font-sans text-[10px] text-muted leading-relaxed line-clamp-2 opacity-80">
                      {item.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}