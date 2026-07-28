/**
 * SubtleVideoBackground
 * ─────────────────────
 * Reusable ultra-subtle looping video background.
 * Stays completely in the background — opacity ~12% with an 85% dark scrim.
 * Uses a random video from /backgrounds/1.mp4, 2.mp4, 3.mp4 on every mount.
 */

const VIDEOS = ["/backgrounds/1.mp4", "/backgrounds/2.mp4", "/backgrounds/3.mp4"];

/** Pick a deterministic video based on an optional index, or random */
function pickVideo(index?: number): string {
  if (index !== undefined) return VIDEOS[index % VIDEOS.length];
  return VIDEOS[Math.floor(Math.random() * VIDEOS.length)];
}

interface Props {
  /** 0 | 1 | 2 — pick a specific video. If undefined, renders nothing. */
  index?: number;
}

export function SubtleVideoBackground({ index }: Props) {
  if (index === undefined) return null;

  const src = VIDEOS[index % VIDEOS.length];

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Video layer — ultra subtle, darkened, and blurred so text is 100% readable */}
      <video
        key={src}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.04, filter: "blur(2px) brightness(0.3) contrast(0.7)" }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Heavy 95% dark scrim — guarantees perfect text contrast */}
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(2,2,2,0.95)" }} />
    </div>
  );
}
