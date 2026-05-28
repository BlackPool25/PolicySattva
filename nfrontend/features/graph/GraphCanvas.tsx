"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { GraphNode, GraphEdge, RiskLevel } from "@/types";

// ─── Risk colors ──────────────────────────────────────────────────────────────
const RISK_COLORS: Record<RiskLevel, { fill: string; stroke: string; glow: string }> = {
  critical: { fill: "#fddcdc", stroke: "#ba1a1a", glow: "rgba(186,26,26,0.4)"  },
  elevated: { fill: "#ede8e3", stroke: "#827367", glow: "rgba(130,115,103,0.3)" },
  standard: { fill: "#eeeeec", stroke: "#9a9c9b", glow: "rgba(116,120,120,0.2)" },
  none:     { fill: "#bdf126", stroke: "#4e6700", glow: "rgba(189,241,38,0.6)"  },
};

// Simple icon paths per node type (drawn in canvas)
function drawNodeIcon(ctx: CanvasRenderingContext2D, type: GraphNode["type"], cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  switch (type) {
    case "document": {
      // Document icon
      const w = size * 0.55, h = size * 0.7;
      ctx.beginPath();
      ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 2);
      ctx.stroke();
      // Lines inside doc
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.28, cy - h * 0.2 + i * (h * 0.18));
        ctx.lineTo(cx + w * 0.28, cy - h * 0.2 + i * (h * 0.18));
        ctx.stroke();
      }
      break;
    }
    case "financial": {
      // Dollar sign
      ctx.font = `bold ${Math.round(size * 0.85)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", cx, cy + 1);
      break;
    }
    case "risk":
    case "clause": {
      if (type === "risk") {
        // Triangle warning
        const s = size * 0.52;
        ctx.beginPath();
        ctx.moveTo(cx, cy - s);
        ctx.lineTo(cx + s * 0.87, cy + s * 0.5);
        ctx.lineTo(cx - s * 0.87, cy + s * 0.5);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy - s * 0.2);
        ctx.lineTo(cx, cy + s * 0.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy + s * 0.3, 1.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Shield / clause marker
        const s2 = size * 0.44;
        ctx.beginPath();
        ctx.moveTo(cx, cy - s2);
        ctx.lineTo(cx + s2 * 0.85, cy - s2 * 0.4);
        ctx.lineTo(cx + s2 * 0.85, cy + s2 * 0.2);
        ctx.quadraticCurveTo(cx + s2 * 0.85, cy + s2 * 0.85, cx, cy + s2);
        ctx.quadraticCurveTo(cx - s2 * 0.85, cy + s2 * 0.85, cx - s2 * 0.85, cy + s2 * 0.2);
        ctx.lineTo(cx - s2 * 0.85, cy - s2 * 0.4);
        ctx.closePath();
        ctx.stroke();
      }
      break;
    }
  }
  ctx.restore();
}

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  zoom: number;
  selectedNode: string | null;
  onSelectNode: (id: string | null) => void;
}

function toCanvas(pct: number, size: number) {
  return (pct / 100) * size;
}

export default function GraphCanvas({ nodes, edges, zoom, selectedNode, onSelectNode }: GraphCanvasProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const frameRef = useRef<number>(0);
  const timeRef  = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);

    const t = timeRef.current;
    timeRef.current += 0.006;

    // Per-node floating offset
    const float = (id: string, axis: "x" | "y") => {
      const seed = id.charCodeAt(0) * 0.73 + (axis === "y" ? 1.6 : 0);
      return Math.sin(t + seed) * 3.5;
    };

    // Compute screen pos for a node
    const pos = (n: GraphNode) => ({
      x: toCanvas(n.x, w) * zoom + (1 - zoom) * (w / 2) + float(n.id, "x"),
      y: toCanvas(n.y, h) * zoom + (1 - zoom) * (h / 2) + float(n.id, "y"),
    });

    // ── Draw edges ──────────────────────────────────────────────────────────
    edges.forEach(edge => {
      const src = nodes.find(n => n.id === edge.source);
      const tgt = nodes.find(n => n.id === edge.target);
      if (!src || !tgt) return;

      const sp = pos(src);
      const tp = pos(tgt);
      const w2 = edge.weight ?? 0.5;

      // Soft curve midpoint
      const mx = (sp.x + tp.x) / 2 + (tp.y - sp.y) * 0.12;
      const my = (sp.y + tp.y) / 2 - (tp.x - sp.x) * 0.12;

      // Glowing lime line
      ctx.save();
      ctx.shadowColor = "rgba(189,241,38,0.35)";
      ctx.shadowBlur  = 8;
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y);
      ctx.quadraticCurveTo(mx, my, tp.x, tp.y);
      ctx.strokeStyle = `rgba(189,241,38,${0.18 + w2 * 0.38})`;
      ctx.lineWidth   = 0.8 + w2 * 1.6;
      ctx.stroke();
      ctx.restore();

      // Faint inner dashed line
      ctx.save();
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y);
      ctx.quadraticCurveTo(mx, my, tp.x, tp.y);
      ctx.strokeStyle = `rgba(100,84,70,${0.1 + w2 * 0.08})`;
      ctx.lineWidth   = 0.7;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    });

    // ── Draw nodes ──────────────────────────────────────────────────────────
    nodes.forEach(node => {
      const p = pos(node);
      const colors = RISK_COLORS[node.risk];
      const isSelected = selectedNode === node.id;
      const isCenter   = !!node.isCenter;
      const R = isCenter ? 30 : 20;

      ctx.save();

      // Glow for selected / center
      if (isSelected || isCenter) {
        ctx.shadowColor = isCenter ? "rgba(189,241,38,0.7)" : colors.glow;
        ctx.shadowBlur  = isCenter ? 28 : 16;
      }

      // Rounded-rect for all nodes (matches screenshot)
      const rw = R * 2.1;
      const rh = R * 1.55;
      ctx.beginPath();
      ctx.roundRect(p.x - rw / 2, p.y - rh / 2, rw, rh, 7);
      ctx.fillStyle   = isCenter ? "#bdf126" : colors.fill;
      ctx.fill();
      ctx.strokeStyle = isCenter ? "#4e6700" : (isSelected ? "#bdf126" : colors.stroke);
      ctx.lineWidth   = isSelected ? 2.2 : 1.4;
      ctx.stroke();

      ctx.restore();

      // Icon inside node
      const iconColor = isCenter ? "#1a1c1b" : colors.stroke;
      drawNodeIcon(ctx, node.type, p.x, p.y - 4, R * 0.5, iconColor);

      // Label below icon
      ctx.font = `${isCenter ? "700" : "500"} ${isCenter ? 11 : 10}px 'Hanken Grotesk', sans-serif`;
      ctx.fillStyle   = isCenter ? "#1a1c1b" : "#2c1810";
      ctx.textAlign   = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, p.x, p.y + R * 0.55);
    });

    frameRef.current = requestAnimationFrame(draw);
  }, [nodes, edges, zoom, selectedNode, size]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [draw]);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Click detection
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { w, h } = size;

    const hit = nodes.find(n => {
      const px = toCanvas(n.x, w) * zoom + (1 - zoom) * (w / 2);
      const py = toCanvas(n.y, h) * zoom + (1 - zoom) * (h / 2);
      const R  = n.isCenter ? 34 : 24;
      return (mx - px) ** 2 + (my - py) ** 2 < R * R;
    });

    onSelectNode(hit ? hit.id : null);
  }, [nodes, zoom, size, onSelectNode]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      <canvas
        ref={canvasRef}
        width={size.w}
        height={size.h}
        onClick={handleClick}
        style={{ width: "100%", height: "100%", cursor: "crosshair", display: "block" }}
        aria-label="Knowledge graph"
      />
    </div>
  );
}
