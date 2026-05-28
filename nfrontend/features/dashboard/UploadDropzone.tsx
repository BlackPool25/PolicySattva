"use client";

import { useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app";
import { documentService } from "@/services/api";

type DropState = "idle" | "drag-over" | "uploading" | "success" | "error";

export default function UploadDropzone() {
  const router = useRouter();
  const { setActiveDocument, setIndexingState } = useAppStore();
  const [state, setState] = useState<DropState>("idle");
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;
      if (file.type !== "application/pdf") {
        setState("error");
        setErrorMsg("PDF files only");
        setTimeout(() => setState("idle"), 2000);
        return;
      }
      setFileName(file.name);
      setState("uploading");

      try {
        const doc = await documentService.upload(file);

        setState("success");
        setActiveDocument(doc);
        setIndexingState({
          step: "extracting",
          progress: 0,
          label: "Extracting text...",
          documentName: file.name,
        });

        setTimeout(() => router.push("/indexing"), 600);
      } catch (err) {
        setState("error");
        setErrorMsg(err instanceof Error ? err.message : "Upload failed");
        setTimeout(() => setState("idle"), 3000);
      }
    },
    [router, setActiveDocument, setIndexingState]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setState("idle");
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setState("drag-over");
  };

  const onDragLeave = () => setState("idle");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const borderColor =
    state === "drag-over" ? "#bdf126" :
    state === "success" ? "#bdf126" :
    state === "error" ? "#ba1a1a" :
    "rgba(106,92,81,0.10)";

  return (
    <div style={{ width: "100%", maxWidth: 360, margin: "0 auto" }}>
      <motion.div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        animate={{ borderColor }}
        transition={{ duration: 0.2 }}
        style={{
          position: "relative",
          borderRadius: 4,
          border: `2px dashed ${borderColor}`,
          background: state === "error" ? "#ffdad6" : "rgba(255,255,255,0.5)",
          padding: 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={onFileChange}
          aria-label="Upload PDF document"
        />

        <AnimatePresence mode="wait">
          {state === "idle" || state === "drag-over" ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
            >
              <div style={{ padding: 12, borderRadius: 4, background: "#f4f4f2" }}>
                <Upload style={{ width: 32, height: 32, color: "#6a5c51" }} strokeWidth={1.5} />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{
                  fontFamily: "'Literata', Georgia, serif",
                  fontSize: 16, fontWeight: 600, color: "#1a1c1b",
                }}>
                  Drop your PDF here
                </p>
                <p style={{
                  fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
                  fontSize: 13, color: "#444748", marginTop: 4,
                }}>
                  or click to browse from your computer
                </p>
              </div>
            </motion.div>
          ) : state === "uploading" ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
            >
              <div style={{ padding: 12, borderRadius: 4, background: "#f4f4f2" }}>
                <Loader2 style={{ width: 32, height: 32, color: "#6a5c51", animation: "spin 1s linear infinite" }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{
                  fontFamily: "'Literata', Georgia, serif",
                  fontSize: 15, fontWeight: 600, color: "#1a1c1b",
                }}>
                  Uploading...
                </p>
                <p style={{
                  fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
                  fontSize: 12, color: "#444748", marginTop: 4,
                  maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {fileName}
                </p>
              </div>
            </motion.div>
          ) : state === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
            >
              <div style={{ padding: 12, borderRadius: 4, background: "#bdf126" }}>
                <CheckCircle style={{ width: 32, height: 32, color: "#1a1c1b" }} />
              </div>
              <p style={{
                fontFamily: "'Literata', Georgia, serif",
                fontSize: 15, fontWeight: 600, color: "#1a1c1b",
              }}>
                Upload complete
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
            >
              <div style={{ padding: 12, borderRadius: 4, background: "#ffdad6" }}>
                <FileText style={{ width: 32, height: 32, color: "#ba1a1a" }} />
              </div>
              <p style={{
                fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
                fontSize: 13, color: "#93000a", fontWeight: 500,
              }}>
                {errorMsg || "PDF files only"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          marginTop: 12,
          width: "100%",
          padding: "10px 0",
          borderRadius: 4,
          background: "#bdf126",
          fontSize: 14,
          fontWeight: 600,
          color: "#1a1c1b",
          border: "none",
          cursor: "pointer",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
          transition: "background 0.2s",
        }}
      >
        Analyze Document
      </motion.button>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10,
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
      }}>
        <ShieldCheck style={{ width: 14, height: 14, color: "#747878" }} />
        <span style={{ fontSize: 12, color: "#6a5c51" }}>Bank-grade Encryption</span>
      </div>
    </div>
  );
}
