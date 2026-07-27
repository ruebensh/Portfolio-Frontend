import { useEffect, useState } from "react";

export function ParticleRevealOverlay() {
  const [active, setActive] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start inverse fade-in immediately on mount
    const frame = requestAnimationFrame(() => {
      setFading(true);
    });

    // Remove overlay once 2.5s inverse fade finishes
    const timer = setTimeout(() => {
      setActive(false);
    }, 2600);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);

  if (!active) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] pointer-events-none overflow-hidden bg-black transition-all duration-[2500ms] ease-in-out ${
        fading ? "opacity-0 backdrop-blur-none" : "opacity-100 backdrop-blur-3xl"
      }`}
    >
      {/* Soft atmospheric cosmic glow fading out with pitch black */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-[400px] h-[400px] sm:w-[700px] sm:h-[700px] rounded-full bg-indigo-500/10 blur-3xl transition-all duration-[2500ms] ease-in-out ${
            fading ? "scale-150 opacity-0" : "scale-100 opacity-100"
          }`}
        />
      </div>
    </div>
  );
}
