"use client";

import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";
import AnalysisCard from "./AnalysisCard";
import type { ChatMessage } from "@/types";

interface ChatBubbleProps {
  message: ChatMessage;
  index?: number;
}

export default function ChatBubble({ message, index = 0 }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 24px",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      {!isUser && (
        <div
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#bdf126",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 2,
          }}
        >
          <Sparkles style={{ width: 14, height: 14, color: "#1a1c1b" }} />
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: "80%",
          alignItems: isUser ? "flex-end" : "flex-start",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            textTransform: "uppercase",
            color: "#444748",
          }}
        >
          {isUser ? "You" : "PolicySattva AI"}
        </span>

        {message.content && (
          <div
            style={{
              borderRadius: 4,
              padding: "12px 16px",
              fontSize: 14,
              lineHeight: 1.6,
              background: isUser ? "#1a1c1b" : "#ffffff",
              color: isUser ? "#ffffff" : "#1a1c1b",
              border: isUser ? "none" : "1px solid rgba(106,92,81,0.10)",
            }}
          >
            {message.content}
          </div>
        )}

        {message.analysisCard && (
          <div style={{ width: "100%" }}>
            <AnalysisCard
              card={message.analysisCard}
              onViewSources={() => {}}
              onOpenGraph={() => {}}
            />
          </div>
        )}

        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "#747878",
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {isUser && (
        <div
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#f4f4f2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 2,
          }}
        >
          <User style={{ width: 14, height: 14, color: "#1a1c1b" }} />
        </div>
      )}
    </motion.div>
  );
}
