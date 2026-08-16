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

  const videoOpacity = tier === "max" ? 0.95 : tier === "ultra" ? 0.82 : 0.65;
  const scrimOpacity = tier === "max" ? 0.10 : tier === "ultra" ? 0.15 : 0.20;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <video
        key={src}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: videoOpacity, filter: tier === "max" ? "brightness(0.95)" : "brightness(0.8)" }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute inset-0" style={{ backgroundColor: `rgba(2,2,2,${scrimOpacity})` }} />
    </div>
  );
}
