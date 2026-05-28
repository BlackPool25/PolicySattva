"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Mic, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const SUGGESTED_PROMPTS = [
  "What are the major risks in this contract?",
  "Explain the indemnity clauses",
  "Summarize liability limits",
  "Find auto-renewal terms",
];

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Ask about this document... e.g. What are the major risk clauses?",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div
      style={{
        borderTop: "1px solid rgba(106,92,81,0.10)",
        background: "#f9f9f7",
        padding: "12px 16px",
      }}
    >
      {!disabled && value === "" && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}
        >
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setValue(prompt);
                textareaRef.current?.focus();
              }}
              style={{
                padding: "4px 10px",
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 500,
                border: "1px solid rgba(106,92,81,0.10)",
                color: "#6a5c51",
                background: "#ffffff",
                cursor: "pointer",
              }}
            >
              {prompt}
            </button>
          ))}
        </motion.div>
      )}

      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            borderRadius: 4,
            border: "1px solid rgba(106,92,81,0.10)",
            background: "#ffffff",
            padding: "8px 12px",
          }}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              background: "transparent",
              fontSize: 14,
              color: "#1a1c1b",
              outline: "none",
              border: "none",
              fontFamily: "system-ui, sans-serif",
              lineHeight: 1.5,
              maxHeight: 120,
              overflowY: "auto",
            }}
            aria-label="Chat input"
          />

          <div style={{ display: "flex", alignItems: "center", gap: 4, paddingBottom: 2 }}>
            <button
              type="button"
              style={{
                padding: 4,
                borderRadius: 4,
                color: "#6a5c51",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              aria-label="Attach file"
            >
              <Paperclip style={{ width: 24, height: 24 }} />
            </button>
            <button
              type="button"
              style={{
                padding: 4,
                borderRadius: 4,
                color: "#6a5c51",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              aria-label="Voice input"
            >
              <Mic style={{ width: 24, height: 24 }} />
            </button>
          </div>
        </div>

        <motion.button
          whileHover={!disabled && value.trim() ? { scale: 1.05 } : {}}
          whileTap={!disabled && value.trim() ? { scale: 0.95 } : {}}
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 4,
            background: "#bdf126",
            border: "none",
            cursor: disabled || !value.trim() ? "not-allowed" : "pointer",
            opacity: disabled || !value.trim() ? 0.4 : 1,
            flexShrink: 0,
          }}
          aria-label="Send message"
        >
          <Send style={{ width: 16, height: 16, color: "#1a1c1b" }} />
        </motion.button>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 6 }}>
        <Sparkles style={{ width: 12, height: 12, color: "#6a5c51" }} />
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            textTransform: "uppercase",
            color: "#6a5c51",
          }}
        >
          LEGAL-GPT V4 OPTIMIZED | 200 token
        </span>
      </div>
    </div>
  );
}
