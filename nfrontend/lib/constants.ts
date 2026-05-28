import type { NavItem, ConceptCluster, GraphNode, GraphEdge, GraphMetrics } from "@/types";

// ─── Navigation ──────────────────────────────────────────────────────────────

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: "Home" },
  { id: "analysis", label: "AI Analysis", href: "/analysis", icon: "Sparkles" },
  { id: "graph", label: "Knowledge Graph", href: "/graph", icon: "Network" },
  { id: "compliance", label: "Compliance", href: "/compliance", icon: "ShieldCheck" },
];

export const TOP_NAV_ITEMS = [
  { label: "Documents", href: "/documents" },
  { label: "Risk Library", href: "/risk-library" },
  { label: "Insights", href: "/insights" },
];

// ─── Mock Graph Data (placeholder until backend) ─────────────────────────────
// TODO: Replace with GET /api/graph/:workspaceId

export const MOCK_GRAPH_NODES: GraphNode[] = [
  { id: "msa", label: "MSA v2.4", type: "document", risk: "none", x: 50, y: 50, isCenter: true },
  { id: "indemnity", label: "Indemnity", type: "clause", risk: "critical", x: 35, y: 22 },
  { id: "liability", label: "Liability Cap", type: "financial", risk: "elevated", x: 67, y: 20 },
  { id: "privacy", label: "Data Privacy", type: "clause", risk: "standard", x: 50, y: 80 },
];

export const MOCK_GRAPH_EDGES: GraphEdge[] = [
  { id: "e1", source: "msa", target: "indemnity", weight: 0.9 },
  { id: "e2", source: "msa", target: "liability", weight: 0.7 },
  { id: "e3", source: "msa", target: "privacy", weight: 0.5 },
  { id: "e4", source: "indemnity", target: "liability", weight: 0.6 },
];

export const MOCK_GRAPH_METRICS: GraphMetrics = {
  activeNodes: 1200,
  relations: 8400,
  risksSet: 0,
  totalTokens: 42000,
};

export const MOCK_CONCEPT_CLUSTERS: ConceptCluster[] = [
  { id: "financial", label: "Financial", color: "#bdf126", active: true, count: 12 },
  { id: "risk", label: "Risk", color: "#ba1a1a", active: true, count: 8 },
  { id: "operational", label: "Operational", color: "#1a1c1b", active: true, count: 6 },
];

// ─── Processing Steps ─────────────────────────────────────────────────────────

export const INDEXING_STEPS = [
  { step: "extracting", label: "Extracting text...", progress: 15 },
  { step: "identifying", label: "Identifying key clauses...", progress: 45 },
  { step: "scanning", label: "Scanning for liabilities...", progress: 75 },
  { step: "complete", label: "Analysis ready.", progress: 100 },
];

// ─── Risk Config ──────────────────────────────────────────────────────────────

export const RISK_CONFIG = {
  critical: {
    label: "Critical Risk",
    color: "#ba1a1a",
    bg: "#ffdad6",
    dotColor: "bg-red-600",
  },
  elevated: {
    label: "Elevated Risk",
    color: "#6a5c51",
    bg: "#f0ebe6",
    dotColor: "bg-espresso-600",
  },
  standard: {
    label: "Standard Clause",
    color: "#444748",
    bg: "#eeeeec",
    dotColor: "bg-outline",
  },
  none: {
    label: "No Risk",
    color: "#4e6700",
    bg: "#bdf126",
    dotColor: "bg-lime-500",
  },
} as const;
