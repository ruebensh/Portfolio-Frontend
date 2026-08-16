import { usePerformance, QualityTier } from "../context/PerformanceContext";

const VIDEOS = ["/backgrounds/1.mp4", "/backgrounds/3.mp4"];

interface Props {
  index?: number;
}

export function SubtleVideoBackground({ index }: Props) {
  const { tier } = usePerformance();

  if (index === undefined) return null;

  const src = VIDEOS[index % VIDEOS.length];

  // Distinct video opacity, filters, and vignette per tier
  const videoConfig: Record<QualityTier, { opacity: number; filter: string; vignette: string }> = {
    best: {
      opacity: 0.95,
      filter: "brightness(0.98) contrast(1.12) saturate(1.20)",
      vignette: "radial-gradient(ellipse at center, rgba(6,6,14,0.35) 0%, rgba(2,2,6,0.72) 100%)",
    },
    max: {
      opacity: 0.88,
      filter: "brightness(0.92) contrast(1.08) saturate(1.10)",
      vignette: "radial-gradient(ellipse at center, rgba(6,6,14,0.45) 0%, rgba(2,2,6,0.78) 100%)",
    },
    ultra: {
      opacity: 0.78,
      filter: "brightness(0.88) contrast(1.04)",
      vignette: "radial-gradient(ellipse at center, rgba(6,6,14,0.52) 0%, rgba(2,2,6,0.82) 100%)",
    },
    high: {
      opacity: 0.65,
      filter: "brightness(0.82) contrast(1.00)",
      vignette: "rgba(2,2,2,0.30)",
    },
    medium: {
      opacity: 0.48,
      filter: "brightness(0.75) blur(0.5px)",
      vignette: "rgba(2,2,2,0.45)",
    },
    low: {
      opacity: 0.28,
      filter: "brightness(0.65) contrast(0.90) blur(1px)",
      vignette: "rgba(2,2,2,0.60)",
    },
  };

  const cfg = videoConfig[tier] || videoConfig.high;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-all duration-700">
      <video
        key={src}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
        style={{ opacity: cfg.opacity, filter: cfg.filter }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{ background: cfg.vignette }}
      />
    </div>
  );
}
