"use client";

interface SkeletonProps {
  style?: React.CSSProperties;
}

export function Skeleton({ style }: SkeletonProps) {
  return (
    <div
      style={{
        borderRadius: 4,
        background: "rgba(106,92,81,0.08)",
        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        ...style,
      }}
    />
  );
}

export function AnalysisCardSkeleton() {
  return (
    <div
      style={{
        border: "1px solid rgba(106,92,81,0.10)",
        borderRadius: 4,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Skeleton style={{ height: 24, width: "60%" }} />
        <Skeleton style={{ height: 20, width: 80, borderRadius: 9999 }} />
      </div>
      <Skeleton style={{ height: 14, width: "100%" }} />
      <Skeleton style={{ height: 14, width: "85%" }} />
      <Skeleton style={{ height: 14, width: "70%" }} />
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <Skeleton style={{ height: 32, width: 120, borderRadius: 4 }} />
        <Skeleton style={{ height: 32, width: 120, borderRadius: 4 }} />
      </div>
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 24px" }}>
      <Skeleton style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton style={{ height: 11, width: "30%" }} />
        <Skeleton style={{ height: 14, width: "80%" }} />
        <Skeleton style={{ height: 14, width: "65%" }} />
      </div>
    </div>
  );
}

export function GraphSkeleton() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <Skeleton style={{ width: 64, height: 64, borderRadius: 8 }} />
        <Skeleton style={{ height: 16, width: 128 }} />
        <Skeleton style={{ height: 12, width: 192 }} />
      </div>
    </div>
  );
}
