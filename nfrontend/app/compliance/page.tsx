"use client";

import { motion } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import OrnamentalCorners from "@/components/shared/OrnamentalCorners";
import { ShieldCheck } from "lucide-react";

export default function CompliancePage() {
  return (
    <AppLayout>
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "48px 24px",
        background: "#f9f9f7",
      }}>
        <OrnamentalCorners size="md" opacity={0.7} />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 384 }}
        >
          <div style={{
            width: 56, height: 56,
            borderRadius: "50%",
            background: "#f4f4f2",
            border: "1px solid rgba(106,92,81,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <ShieldCheck style={{ width: 28, height: 28, color: "#6a5c51" }} />
          </div>
          <h2 style={{
            fontFamily: "'Literata', Georgia, serif",
            fontSize: 24,
            fontWeight: 600,
            color: "#1a1c1b",
            marginBottom: 8,
          }}>
            Compliance Engine
          </h2>
          <p style={{
            fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
            fontSize: 16,
            color: "#444748",
            lineHeight: 1.6,
          }}>
            Automated compliance checks against regulatory frameworks — GDPR, SOC 2, HIPAA, and
            custom rule sets.
          </p>
          <div style={{
            marginTop: 24,
            padding: "8px 16px",
            borderRadius: 4,
            background: "#f4f4f2",
            border: "1px solid rgba(106,92,81,0.10)",
            display: "inline-block",
          }}>
            <span style={{
              fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#6a5c51",
            }}>
              Coming Soon · Backend Integration Ready
            </span>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
