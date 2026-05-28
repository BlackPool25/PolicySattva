"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import OrnamentalCorners from "@/components/shared/OrnamentalCorners";
import UploadDropzone from "@/features/dashboard/UploadDropzone";

const FOOTER_LINKS = [
  "Privacy Policy",
  "Terms of Service",
  "Security Architecture",
  "Contact Support",
];

export default function DashboardPage() {
  return (
    <AppLayout>
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 52px)",
          background: "#f9f9f7",
        }}
      >
        <OrnamentalCorners size="lg" />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px 24px 48px",
            position: "relative",
            zIndex: 10,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: 40, maxWidth: 680 }}
          >
            <h1
              style={{
                fontFamily: "'Literata', Georgia, serif",
                fontSize: "clamp(32px, 4.5vw, 48px)",
                fontWeight: 700,
                color: "#1a1c1b",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                margin: "0 auto",
              }}
            >
              Know exactly what you&rsquo;re agreeing to
            </h1>
            <p
              style={{
                marginTop: 20,
                fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
                fontSize: 18,
                fontWeight: 400,
                lineHeight: "28px",
                color: "#444748",
                maxWidth: 500,
                margin: "20px auto 0",
              }}
            >
              Instantly analyze complex legal documents, uncover hidden risks, and extract
              key obligations with AI-driven precision.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#ffffff",
              borderRadius: "0.25rem",
              border: "1px solid rgba(106,92,81,0.10)",
              padding: 24,
            }}
          >
            <UploadDropzone />
          </motion.div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              marginTop: 32,
              fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            <ShieldCheck style={{ width: 14, height: 14, color: "#747878" }} />
            <span style={{ color: "#6a5c51" }}>Bank-grade Encryption &bull; SOC 2 Compliant</span>
          </div>
        </div>

        <footer
          style={{
            position: "relative",
            zIndex: 10,
            borderTop: "1px solid rgba(106,92,81,0.10)",
            padding: "14px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              marginBottom: 6,
            }}
          >
            {FOOTER_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#6a5c51",
                  textDecoration: "none",
                }}
              >
                {link}
              </a>
            ))}
          </div>
          <p
            style={{
              textAlign: "center",
              fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 500,
              color: "#6a5c51",
              margin: 0,
            }}
          >
            &copy; 2025 PolicySattva Legal Systems. All rights reserved.
          </p>
        </footer>
      </div>
    </AppLayout>
  );
}
