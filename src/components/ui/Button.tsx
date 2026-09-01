"use client";

import React from "react";
import Link from "next/link";
import NeonGlowButton from "@/components/originkit/ui/neon-glow-button";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  showArrow?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  href,
  onClick,
  variant = "primary",
  showArrow = false,
  className = "",
}) => {
  const isPrimary = variant === "primary";
  const labelText = typeof children === "string" ? children : String(children);

  const neonColors = isPrimary
    ? {
        fill: "#09090b",
        hoverFill: "#18181b",
        textColor: "#ffffff",
        hoverTextColor: "#c7d2fe",
      }
    : {
        fill: "#09090b",
        hoverFill: "#18181b",
        textColor: "#f4f4f5",
        hoverTextColor: "#a5f3fc",
      };

  const neonGlow = isPrimary
    ? { color: "#6366f1", size: 6, blur: 6 }
    : { color: "#38bdf8", size: 5, blur: 5 };

  const neonBorder = isPrimary
    ? {
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#6366f1",
      }
    : {
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#38bdf8",
      };

  const iconConfig = showArrow
    ? {
        side: "right" as const,
        size: 15,
        type: "symbol" as const,
        symbol: "↗",
        color: isPrimary ? "#ffffff" : "#f4f4f5",
        hoverColor: isPrimary ? "#c7d2fe" : "#a5f3fc",
      }
    : undefined;

  const buttonContent = (
    <NeonGlowButton
      label={labelText}
      showText={true}
      padding="12px 20px"
      rounded={100}
      colors={neonColors}
      glow={neonGlow}
      border={neonBorder}
      addIcon={showArrow}
      icon={iconConfig}
      font={{
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.01em",
      }}
      style={{ cursor: "pointer", width: "100%" }}
    />
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={`inline-flex justify-center max-w-full ${className}`}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <span onClick={onClick} className={`inline-flex justify-center cursor-pointer max-w-full ${className}`}>
      {buttonContent}
    </span>
  );
};
