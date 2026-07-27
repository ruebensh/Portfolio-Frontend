import { useEffect, useState } from "react";

export function ParticleRevealOverlay() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActive(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Pitch-black to transparent backdrop blur transition */}
      <div className="absolute inset-0 bg-black animate-[fadeOut_0.9s_ease-out_forwards] backdrop-blur-3xl" />

      {/* Cosmic shockwave dissipation ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full border border-indigo-400/40 bg-indigo-500/10 blur-xl animate-[ping_0.9s_cubic-bezier(0,0,0.2,1)_forwards]" />
      </div>
    </div>
  );
}
