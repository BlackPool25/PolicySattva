"use client";

import { motion } from "framer-motion";
import { FileText, ExternalLink } from "lucide-react";
import RiskBadge from "@/components/shared/RiskBadge";
import type { AnalysisCard as AnalysisCardType } from "@/types";

interface AnalysisCardProps {
  card: AnalysisCardType;
  onViewSources?: (id: string) => void;
  onOpenGraph?: (id: string) => void;
}

export default function AnalysisCard({ card, onViewSources, onOpenGraph }: AnalysisCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -1 }}
      style={{
        position: "relative",
        borderRadius: 4,
        border: "1px solid rgba(189,241,38,0.4)",
        background: "#ffffff",
        padding: 20,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: "#bdf126",
        }}
      />

      <div style={{ paddingLeft: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <h3
            style={{
              fontFamily: "Literata, Georgia, serif",
              fontSize: 24,
              fontWeight: 600,
              color: "#1a1c1b",
              flex: 1,
              minWidth: 0,
            }}
          >
            {card.title}
          </h3>
          <RiskBadge level={card.risk.level} size="sm" />
        </div>

        <p
          style={{
            fontSize: 14,
            color: "#1a1c1b",
            lineHeight: 1.65,
          }}
        >
          {card.summary}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 16 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewSources?.(card.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid rgba(106,92,81,0.10)",
              fontSize: 14,
              fontWeight: 500,
              color: "#6a5c51",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <FileText style={{ width: 14, height: 14 }} />
            View Source Clauses
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenGraph?.(card.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid rgba(106,92,81,0.10)",
              fontSize: 14,
              fontWeight: 500,
              color: "#6a5c51",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <ExternalLink style={{ width: 14, height: 14 }} />
            Open Knowledge Graph
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
