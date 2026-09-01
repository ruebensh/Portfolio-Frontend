"use client";

import React, { forwardRef } from "react";

interface FloatingSceneCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 * Wraps a card that will be 3D-choreographed by Hero scroll progress.
 *
 * Layout strategy:
 *   - Outer div: position:absolute, inset:0, flex-center → card naturally
 *     sits at the viewport center regardless of its own dimensions.
 *   - Inner div (ref): receives choreography transforms (translate3d, rotate3d,
 *     scale). Because the outer wrapper centers it, translate3d offsets are
 *     correctly relative to the screen center — no margin-% hack needed.
 */
export const FloatingSceneCard = forwardRef<HTMLDivElement, FloatingSceneCardProps>(
  ({ children, className = "", id }, ref) => {
    return (
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          id={id}
          ref={ref}
          className={`origin-center ${className}`}
          style={{
            opacity: 0,
            transform: "translate3d(0,0,0) scale(0.1)",
            willChange: "transform, opacity",
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

FloatingSceneCard.displayName = "FloatingSceneCard";
