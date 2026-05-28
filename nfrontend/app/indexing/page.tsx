"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app";
import { indexingService } from "@/services/api";
import { FileText, CheckCircle } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import OrnamentalCorners from "@/components/shared/OrnamentalCorners";

const TERTIARY = "#6a5c51";
const ON_SURFACE = "#1a1c1b";
const ON_SURFACE_VARIANT = "#444748";
const LIME = "#bdf126";
const ON_SECONDARY_CONTAINER = "#516b00";
const SURFACE_CONTAINER_LOW = "#f4f4f2";
const PENDING_DOT = "#c4c7c8";
const BORDER = "1px solid rgba(106,92,81,0.10)";

const CIRCUMFERENCE = 2 * Math.PI * 28;

const STEPS = [
  { id: "extracting", label: "Extracting text" },
  { id: "identifying", label: "Identifying clauses" },
  { id: "scanning", label: "Scanning liabilities" },
  { id: "building", label: "Building graph" },
] as const;

type StepId = typeof STEPS[number]["id"];

const PROGRESS_BY_STEP: Record<StepId, number> = {
  extracting: 15,
  identifying: 45,
  scanning: 75,
  building: 95,
};

const SUB_LABELS: Record<StepId, string> = {
  extracting: "Parsing PDF structure and extracting raw text content",
  identifying: "Locating obligations, rights, and defined terms",
  scanning: "Cross-referencing against legal risk databases",
  building: "Mapping entity relationships and clause dependencies",
};

const DOC_STATS = [
  { label: "Pages", value: "47" },
  { label: "Clauses", value: "120+" },
  { label: "Tokens", value: "~42k" },
  { label: "Risk Areas", value: "Scanning..." },
];

export default function IndexingPage() {
  const router = useRouter();
  const { activeDocument } = useAppStore();

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = STEPS[currentStepIdx];
  const targetProgress = done ? 100 : PROGRESS_BY_STEP[currentStep.id];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < targetProgress) return Math.min(prev + 1, targetProgress);
        return prev;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [targetProgress]);

  useEffect(() => {
    if (!activeDocument?.id) return;

    pollRef.current = setInterval(async () => {
      try {
        const status = await indexingService.getStatus(activeDocument.id);
        if (!status) return;

        if (status.status === "ready") {
          if (pollRef.current) clearInterval(pollRef.current);
          setCompletedSteps(new Set([0, 1, 2, 3]));
          setCurrentStepIdx(3);
          setTimeout(() => {
            setProgress(100);
            setDone(true);
          }, 600);
        } else if (status.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // polling silently
      }
    }, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeDocument?.id]);

  useEffect(() => {
    if (done) return;
    const timer = setTimeout(() => {
      setCompletedSteps((prev) => new Set([...prev, currentStepIdx]));
      if (currentStepIdx < STEPS.length - 1) {
        setCurrentStepIdx((i) => i + 1);
      } else {
        setTimeout(() => {
          setProgress(100);
          setDone(true);
        }, 600);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [currentStepIdx, done]);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => router.push("/analysis"), 2200);
    return () => clearTimeout(t);
  }, [done, router]);

  function stepStatus(idx: number) {
    if (completedSteps.has(idx)) return "completed";
    if (currentStepIdx === idx && !done) return "current";
    return "pending";
  }

  return (
    <AppLayout>
      <div
        className="parchment-bg"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          padding: "48px 16px",
        }}
      >
        <OrnamentalCorners size="lg" />

        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 480 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: "#ffffff",
              borderRadius: 4,
              border: BORDER,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{ padding: "24px 24px 16px", borderBottom: BORDER }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    background: SURFACE_CONTAINER_LOW,
                  }}
                >
                  <FileText style={{ width: 20, height: 20, color: TERTIARY }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: '"Hanken Grotesk", sans-serif',
                      fontSize: 16,
                      fontWeight: 600,
                      color: ON_SURFACE,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {activeDocument?.name ?? "MSA_Agreement_v2.4.pdf"}
                  </p>
                  <p
                    style={{
                      fontFamily: '"Hanken Grotesk", sans-serif',
                      fontSize: 12,
                      fontWeight: 500,
                      color: ON_SURFACE_VARIANT,
                      marginTop: 2,
                    }}
                  >
                    Master Services Agreement · Version 2.4
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 12,
                }}
              >
                {DOC_STATS.map((s) => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <p
                      style={{
                        fontFamily: '"Literata", serif',
                        fontSize: 24,
                        fontWeight: 600,
                        lineHeight: "32px",
                        color: ON_SURFACE,
                      }}
                    >
                      {s.value}
                    </p>
                    <p
                      style={{
                        fontFamily: '"Hanken Grotesk", sans-serif',
                        fontSize: 12,
                        fontWeight: 500,
                        color: ON_SURFACE_VARIANT,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Center state */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "32px 24px",
              }}
            >
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: SURFACE_CONTAINER_LOW,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 0 24px rgba(189,241,38,0.5)",
                      }}
                    >
                      <CheckCircle style={{ width: 32, height: 32, color: LIME }} />
                    </div>
                    <p
                      style={{
                        fontFamily: '"Literata", serif',
                        fontSize: 24,
                        fontWeight: 600,
                        lineHeight: "32px",
                        color: ON_SURFACE,
                      }}
                    >
                      Analysis Ready
                    </p>
                    <p
                      style={{
                        fontFamily: '"Hanken Grotesk", sans-serif',
                        fontSize: 16,
                        fontWeight: 400,
                        color: ON_SURFACE_VARIANT,
                        textAlign: "center",
                      }}
                    >
                      Redirecting...
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div style={{ position: "relative", width: 64, height: 64 }}>
                      <svg
                        style={{ width: 64, height: 64 }}
                        viewBox="0 0 64 64"
                        fill="none"
                      >
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="rgba(106,92,81,0.10)"
                          strokeWidth="4"
                        />
                        <motion.circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke={LIME}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={CIRCUMFERENCE}
                          animate={{
                            strokeDashoffset:
                              CIRCUMFERENCE * (1 - progress / 100),
                          }}
                          style={{
                            rotate: -90,
                            transformOrigin: "32px 32px",
                          }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                      </svg>
                    </div>
                    <p
                      style={{
                        fontFamily: '"Literata", serif',
                        fontSize: 24,
                        fontWeight: 600,
                        lineHeight: "32px",
                        color: ON_SURFACE,
                      }}
                    >
                      Reading your document...
                    </p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={currentStep.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.25 }}
                        style={{
                          fontFamily: '"Hanken Grotesk", sans-serif',
                          fontSize: 16,
                          fontWeight: 400,
                          color: ON_SURFACE_VARIANT,
                          textAlign: "center",
                        }}
                      >
                        {SUB_LABELS[currentStep.id]}
                      </motion.p>
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress bar */}
              <div style={{ width: "100%", marginTop: 24, marginBottom: 4 }}>
                <div
                  style={{
                    height: 6,
                    width: "100%",
                    borderRadius: 9999,
                    background: "rgba(106,92,81,0.10)",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    style={{
                      height: "100%",
                      borderRadius: 9999,
                      background: LIME,
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: '"Hanken Grotesk", sans-serif',
                      fontSize: 12,
                      fontWeight: 500,
                      color: ON_SURFACE_VARIANT,
                    }}
                  >
                    {done ? "Complete" : currentStep.label}
                  </span>
                  <span
                    style={{
                      fontFamily: '"Hanken Grotesk", sans-serif',
                      fontSize: 12,
                      fontWeight: 500,
                      color: ON_SURFACE,
                    }}
                  >
                    {progress}%
                  </span>
                </div>
              </div>
            </div>

            {/* Step checklist */}
            <div style={{ borderTop: BORDER, padding: "16px 24px" }}>
              {STEPS.map((step, idx) => {
                const status = stepStatus(idx);
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom:
                        idx < STEPS.length - 1 ? 12 : 0,
                    }}
                  >
                    {/* Status circle */}
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        ...(status === "completed"
                          ? { background: LIME }
                          : status === "current"
                            ? {
                                background: "transparent",
                                border: `2px solid ${LIME}`,
                              }
                            : {
                                background: "transparent",
                                border: `2px solid ${PENDING_DOT}`,
                              }),
                      }}
                    >
                      {status === "completed" ? (
                        <CheckCircle
                          style={{
                            width: 14,
                            height: 14,
                            color: ON_SECONDARY_CONTAINER,
                          }}
                        />
                      ) : status === "current" ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            border: `2px solid ${LIME}`,
                            borderTopColor: "transparent",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: PENDING_DOT,
                          }}
                        />
                      )}
                    </div>

                    <p
                      style={{
                        flex: 1,
                        fontFamily: '"Hanken Grotesk", sans-serif',
                        fontSize: 16,
                        fontWeight: 400,
                        color:
                          status === "completed"
                            ? ON_SURFACE_VARIANT
                            : status === "current"
                              ? ON_SURFACE
                              : PENDING_DOT,
                        textDecoration:
                          status === "completed" ? "line-through" : "none",
                      }}
                    >
                      {step.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Skip to analysis */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 16,
            }}
          >
            <button
              onClick={() => router.push("/analysis")}
              style={{
                fontFamily: '"Hanken Grotesk", sans-serif',
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: TERTIARY,
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              Skip to analysis
            </button>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
