"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import OrnamentalCorners from "@/components/shared/OrnamentalCorners";
import ChatBubble from "@/features/analysis/ChatBubble";
import ChatInput from "@/features/analysis/ChatInput";
import type { ChatMessage } from "@/types";
import { useAppStore } from "@/store/app";
import { analysisService } from "@/services/api";

const BORDER = "1px solid rgba(106,92,81,0.10)";
const TERTIARY = "#6a5c51";

const GRAPH_STATS = [
  { label: "Graph Metrics", value: "8.3%" },
  { label: "Graph Havers", value: "2.6%" },
  { label: "Graph Risks Set", value: "0" },
  { label: "Total Tokens", value: "42K" },
];

const CONCEPT_CLUSTERS_TAGS = [
  "concept clusters",
  "acquoration management",
  "nensosity protectuation",
  "concept results",
];

export default function AnalysisPage() {
  const { activeDocument, messages, addMessage, isQuerying, setIsQuerying } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const handleSend = useCallback(async (text: string) => {
    setIsQuerying(true);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(), role: "user", content: text,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);

    try {
      const aiMsg = await analysisService.sendMessage(
        activeDocument?.id ?? "default",
        text,
        activeDocument?.name ?? null,
      );
      addMessage(aiMsg);
    } catch {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(), role: "assistant",
        content: "Sorry, I couldn't complete the analysis. Please check the backend connection.",
        timestamp: new Date().toISOString(),
      };
      addMessage(errMsg);
    } finally {
      setIsQuerying(false);
    }
  }, [activeDocument, addMessage, setIsQuerying]);

  return (
    <AppLayout>
      <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 52px)" }}>
        <aside style={{
          width: 200,
          flexShrink: 0,
          borderRight: BORDER,
          background: "#f4f4f2",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
        }}>
          <div style={{ padding: "12px 14px", borderBottom: BORDER }}>
            <p style={{
              fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
              fontSize: 14, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.05em",
              lineHeight: "20px",
              color: TERTIARY, marginBottom: 8,
            }}>
              Graph Metrics
            </p>
            {GRAPH_STATS.map(s => (
              <div key={s.label} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 4,
              }}>
                <span style={{
                  fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
                  fontSize: 16, fontWeight: 400, lineHeight: "24px",
                  color: "#444748",
                }}>{s.label}</span>
                <span style={{
                  fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
                  fontSize: 16, fontWeight: 600, lineHeight: "24px",
                  color: "#1a1c1b",
                }}>{s.value}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: "10px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <p style={{
                fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
                fontSize: 14, fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.05em",
                lineHeight: "20px",
                color: TERTIARY,
              }}>
                Concept Clusters
              </p>
              <span style={{
                fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
                fontSize: 12, fontWeight: 500, lineHeight: "16px",
                color: TERTIARY,
              }}>
                15 except widgets
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {CONCEPT_CLUSTERS_TAGS.map(tag => (
                <span key={tag} style={{
                  padding: "4px 12px", borderRadius: 9999,
                  fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
                  fontSize: 12, fontWeight: 500, lineHeight: "16px",
                  background: "#bdf126", color: "#1a1c1b",
                  display: "inline-block",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>

        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          minWidth: 0,
          background: "#f9f9f7",
        }}>
          <OrnamentalCorners size="md" opacity={0.55} />

          <div
            ref={scrollRef}
            style={{ flex: 1, overflowY: "auto", padding: "16px 0", position: "relative", zIndex: 5 }}
            role="log"
            aria-label="Chat messages"
          >
            {messages.map((msg, i) => (
              <ChatBubble key={msg.id} message={msg} index={i} />
            ))}

            <AnimatePresence>
              {isQuerying && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px" }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", background: "#bdf126",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24">
                        <path stroke="#1a1c1b" strokeWidth="2" strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                    </motion.div>
                  </div>
                  <div style={{
                    display: "flex", gap: 6, alignItems: "center",
                    background: "#ffffff",
                    border: BORDER,
                    borderRadius: 6, padding: "8px 12px",
                  }}>
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                        style={{ width: 6, height: 6, borderRadius: "50%", background: TERTIARY, display: "inline-block" }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ position: "relative", zIndex: 10 }}>
            <ChatInput onSend={handleSend} disabled={isQuerying} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
