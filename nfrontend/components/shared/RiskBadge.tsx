"use client";

import type { RiskLevel } from "@/types";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md";
}

const RISK_CONFIG: Record<RiskLevel, { dot: string; bg: string; text: string; label: string }> = {
  critical: { dot: "#ba1a1a", bg: "#ffdad6", text: "#ba1a1a", label: "Critical Risk" },
  elevated: { dot: "#6a5c51", bg: "#f0ebe6", text: "#6a5c51", label: "Elevated Risk" },
  standard: { dot: "#444748", bg: "#eeeeec", text: "#444748", label: "Standard Clause" },
  none: { dot: "#4e6700", bg: "#bdf126", text: "#4e6700", label: "No Risk" },
};

export default function RiskBadge({ level, size = "sm" }: RiskBadgeProps) {
  const config = RISK_CONFIG[level];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 500,
        background: config.bg,
        color: config.text,
        border: "1px solid rgba(106,92,81,0.10)",
        padding: size === "sm" ? "2px 8px" : "4px 10px",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: size === "sm" ? 6 : 8,
          height: size === "sm" ? 6 : 8,
          borderRadius: "50%",
          background: config.dot,
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
}
