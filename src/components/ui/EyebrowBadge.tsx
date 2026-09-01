import React from "react";

export const EyebrowBadge = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-widest text-accent border border-accent/20 px-3 py-1 inline-block ${className}`}
    >
      {children}
    </span>
  );
};
