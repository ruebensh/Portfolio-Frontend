import { usePerformance } from "../context/PerformanceContext";

const VIDEOS = ["/backgrounds/1.mp4", "/backgrounds/3.mp4"];

interface Props {
  index?: number;
}

export function SubtleVideoBackground({ index }: Props) {
  const { tier } = usePerformance();

  // Low tier (VirtualBox / CPU rendering / Low-end device) disables video to save CPU/GPU decoders
  if (index === undefined || tier === "low") return null;

  const src = VIDEOS[index % VIDEOS.length];

  const videoOpacity = tier === "best" ? 0.92 : tier === "max" ? 0.85 : tier === "ultra" ? 0.75 : 0.60;
  const scrimOpacity = tier === "best" ? 0.35 : tier === "max" ? 0.25 : tier === "ultra" ? 0.20 : 0.20;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <video
        key={src}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: videoOpacity, filter: tier === "best" ? "brightness(0.92) contrast(1.05)" : tier === "max" ? "brightness(0.90)" : "brightness(0.8)" }}
      >
        <source src={src} type="video/mp4" />
      </video>
      {/* Dark contrast radial vignette overlay — keeps text 100% sharp and readable */}
      <div
        className="absolute inset-0"
        style={{
          background: tier === "best"
            ? "radial-gradient(ellipse at center, rgba(6,6,14,0.48) 0%, rgba(2,2,6,0.78) 100%)"
            : `rgba(2,2,2,${scrimOpacity})`
        }}
      />
    </div>
  );
}
