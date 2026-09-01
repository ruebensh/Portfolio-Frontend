"use client";

import { ReactLenis } from "lenis/react";
import React from "react";

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1, // Adjusted for Safari/iOS
        duration: 1.5,
        smoothWheel: true,
        syncTouch: false, // Prevents stutter on iOS
      }}
    >
      {children}
    </ReactLenis>
  );
}
