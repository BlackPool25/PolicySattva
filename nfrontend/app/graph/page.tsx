"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize2, X } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import GraphCanvas from "@/features/graph/GraphCanvas";
import RiskBadge from "@/components/shared/RiskBadge";
import type { GraphNode, GraphEdge, RiskLevel, GraphMetrics } from "@/types";
import { graphService } from "@/services/api";

const BORDER = "1px solid rgba(106,92,81,0.10)";

const RISK_LEGEND: { level: RiskLevel; label: string }[] = [
  { level: "critical", label: "Critical Risk (Action Required)" },
  { level: "elevated", label: "Elevated Risk (Monitor)" },
  { level: "standard", label: "Standard Clause" },
];

const POSITIONS: [number, number][] = [
  [50, 50], [28, 20], [68, 18], [80, 52],
  [66, 78], [30, 76], [16, 52], [50, 18],
  [20, 40], [75, 35], [40, 85], [85, 70],
  [10, 80], [90, 10], [35, 10],
];

export default function GraphPage() {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [metrics, setMetrics] = useState<GraphMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [graphNodes, graphEdges, graphMetrics] = await Promise.all([
          graphService.getNodes("default"),
          graphService.getEdges("default"),
          graphService.getMetrics("default"),
        ]);
        const positioned = graphNodes.map((n, i) => {
          if (i < POSITIONS.length) {
            const pos = POSITIONS[i];
            return { ...n, x: pos[0], y: pos[1], isCenter: i === 0 };
          }
          return {
            ...n,
            x: 20 + Math.random() * 60,
            y: 15 + Math.random() * 70,
            isCenter: i === 0,
          };
        });
        setNodes(positioned);
        setEdges(graphEdges);
        if (graphMetrics) {
          setMetrics({
            activeNodes: graphMetrics.activeNodes,
            relations: graphMetrics.relations,
            risksSet: graphMetrics.risksSet,
            totalTokens: graphMetrics.totalTokens,
          });
        } else {
          setMetrics({
            activeNodes: positioned.length,
            relations: graphEdges.length,
            risksSet: positioned.filter((n) => n.risk === "critical" || n.risk === "elevated").length,
            totalTokens: 0,
          });
        }
      } catch {
        setNodes([]);
        setEdges([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleZoomIn  = () => setZoom((z) => Math.min(z + 0.15, 2.0));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.4));
  const handleReset   = () => { setZoom(1); setSelectedNode(null); };

  const selectedNodeData = nodes.find((n) => n.id === selectedNode);
  const connectionCount = selectedNodeData
    ? edges.filter((e) => e.source === selectedNodeData.id || e.target === selectedNodeData.id).length
    : 0;

  const METRIC_ITEMS: { label: string; value: number | string }[] = metrics
    ? [
        { label: "Active Nodes", value: metrics.activeNodes },
        { label: "Relations", value: metrics.relations },
        { label: "Risk Items", value: metrics.risksSet },
        { label: "Total Tokens", value: metrics.totalTokens.toLocaleString() },
      ]
    : [];

  return (
    <AppLayout>
      <div
        className="graph-bg"
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          height: "calc(100vh - 52px)",
        }}
      >
        {loading ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 5,
              fontSize: 14,
              color: "#6a5c51",
              fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
            }}
          >
            Loading graph data...
          </div>
        ) : (
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            zoom={zoom}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
          />
        )}

        {/* Graph Metrics bar */}
        {!loading && METRIC_ITEMS.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              display: "flex",
              gap: 8,
            }}
          >
            {METRIC_ITEMS.map((item) => (
              <div
                key={item.label}
                style={{
                  background: "#ffffff",
                  border: BORDER,
                  borderRadius: 4,
                  padding: "6px 14px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    lineHeight: "16px",
                    color: "#1a1c1b",
                    fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
                  }}
                >
                  {item.value}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    lineHeight: "14px",
                    color: "#444748",
                    fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Zoom controls — top right */}
        <div
          style={{
            position: "absolute",
            right: 14,
            top: 14,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {([
            { Icon: ZoomIn, onClick: handleZoomIn, label: "Zoom in" },
            { Icon: ZoomOut, onClick: handleZoomOut, label: "Zoom out" },
            { Icon: Maximize2, onClick: handleReset, label: "Reset" },
          ] as const).map(({ Icon, onClick, label }) => (
            <button
              key={label}
              onClick={onClick}
              aria-label={label}
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                border: BORDER,
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6a5c51",
                cursor: "pointer",
                transition: "background 0.12s",
              }}
            >
              <Icon style={{ width: 14, height: 14 }} />
            </button>
          ))}
        </div>

        {/* Risk Assessment legend — bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            zIndex: 10,
            background: "#ffffff",
            border: BORDER,
            borderRadius: 4,
            padding: 16,
            minWidth: 215,
            fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
          }}
        >
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#444748",
              margin: "0 0 10px",
            }}
          >
            RISK ASSESSMENT
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {RISK_LEGEND.map(({ level, label }) => (
              <div key={level} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <RiskBadge level={level} size="sm" />
                <span style={{ fontSize: 12, color: "#1a1c1b" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Node detail panel */}
        <AnimatePresence>
          {selectedNodeData && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                width: 360,
                maxWidth: "calc(100% - 40px)",
                zIndex: 20,
              }}
            >
              <div
                style={{
                  borderRadius: 4,
                  border: BORDER,
                  background: "#ffffff",
                  padding: "14px 16px",
                  fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                        flexWrap: "wrap",
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: "'Literata', Georgia, serif",
                          fontSize: 24,
                          fontWeight: 600,
                          lineHeight: "32px",
                          color: "#1a1c1b",
                          margin: 0,
                        }}
                      >
                        {selectedNodeData.label}
                      </h3>
                      <RiskBadge level={selectedNodeData.risk} size="sm" />
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#444748",
                        textTransform: "capitalize",
                        margin: 0,
                        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
                      }}
                    >
                      Type: {selectedNodeData.type} &middot; {connectionCount} connections
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => setSelectedNode(null)}
                      style={{
                        color: "#6a5c51",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <X style={{ width: 15, height: 15 }} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
