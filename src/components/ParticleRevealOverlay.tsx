import { useEffect, useState } from "react";

export function ParticleRevealOverlay() {
  const [opacity, setOpacity] = useState(1);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    // Start 1-second reverse fade-in from pitch black onto Home Page
    const rAF = requestAnimationFrame(() => {
      setOpacity(0);
    });

    const timer = setTimeout(() => {
      setMounted(false);
    }, 1050);

    return () => {
      cancelAnimationFrame(rAF);
      clearTimeout(timer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#000000] pointer-events-none transition-opacity duration-1000 ease-in-out"
      style={{ opacity }}
    />
  );
}
