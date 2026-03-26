import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { create } from "zustand";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
});

export type DocumentStatus = "indexing" | "ready" | "failed";

export type DocumentItem = {
  id: string;
  name: string;
  status: DocumentStatus;
};

export type SourceClause = {
  file: string;
  excerpt: string;
};

export type QueryResponse = {
  answer: string;
  risk_level: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
  source_clauses: SourceClause[];
  graph_nodes_involved: string[];
};

export type GraphNode = {
  id: string;
  label: string;
  type?: string;
};

export type GraphEdge = {
  source: string;
  target: string;
  label?: string;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    node_count: number;
    edge_count: number;
  };
};

export type NodeDetail = {
  id: string;
  label: string;
  description: string;
  type: string;
  source_files: string[];
};

export type ChatItem = {
  id: string;
  role: "user" | "assistant";
  content: string;
  risk?: QueryResponse["risk_level"];
  sources?: SourceClause[];
  graphNodes?: string[];
  docFilter?: string | null;
};

type AppStore = {
  documents: DocumentItem[];
  activeDocId: string | null;
  chatHistory: ChatItem[];
  graphData: GraphData;
  highlightedNodes: string[];
  upsertDocument: (doc: DocumentItem) => void;
  setDocumentStatus: (docId: string, status: DocumentStatus) => void;
  setActiveDoc: (docId: string | null) => void;
  addUserMessage: (content: string) => void;
  addAssistantMessage: (data: QueryResponse, docFilter?: string | null) => void;
  clearChat: () => void;
  setGraphData: (data: GraphData) => void;
  setHighlightedNodes: (nodes: string[]) => void;
};

const preIndexedDocuments: DocumentItem[] = [
  { id: "truecaller_tos.pdf", name: "truecaller_tos.pdf", status: "ready" },
  { id: "phonepe_terms.pdf", name: "phonepe_terms.pdf", status: "ready" },
  { id: "paytm_terms.pdf", name: "paytm_terms.pdf", status: "ready" },
];

export const useAppStore = create<AppStore>((set) => ({
  documents: preIndexedDocuments,
  activeDocId: preIndexedDocuments[0]?.id ?? null,
  chatHistory: [],
  graphData: {
    nodes: [],
    edges: [],
    stats: { node_count: 0, edge_count: 0 },
  },
  highlightedNodes: [],
  upsertDocument: (doc) =>
    set((state) => {
      const exists = state.documents.some((item) => item.id === doc.id);
      if (!exists) {
        return { documents: [doc, ...state.documents] };
      }
      return {
        documents: state.documents.map((item) => (item.id === doc.id ? doc : item)),
      };
    }),
  setDocumentStatus: (docId, status) =>
    set((state) => ({
      documents: state.documents.map((item) =>
        item.id === docId ? { ...item, status } : item
      ),
    })),
  setActiveDoc: (docId) => set({ activeDocId: docId }),
  addUserMessage: (content) =>
    set((state) => ({
      chatHistory: [
        ...state.chatHistory,
        { id: crypto.randomUUID(), role: "user", content },
      ],
    })),
  addAssistantMessage: (data, docFilter) =>
    set((state) => ({
      chatHistory: [
        ...state.chatHistory,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer,
          risk: data.risk_level,
          sources: data.source_clauses,
          graphNodes: data.graph_nodes_involved,
          docFilter: docFilter ?? null,
        },
      ],
    })),
  clearChat: () => set({ chatHistory: [] }),
  setGraphData: (data) => set({ graphData: data }),
  setHighlightedNodes: (nodes) => set({ highlightedNodes: nodes }),
}));

export async function ingestDocument(file: File): Promise<{ doc_id: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<{ status: string; doc_id: string }>("/ingest", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return { doc_id: response.data.doc_id };
}

export async function getIngestStatus(docId: string): Promise<DocumentStatus> {
  const response = await api.get<{ doc_id: string; status: DocumentStatus }>(`/ingest/status/${docId}`);
  return response.data.status;
}

export async function queryDocument(payload: {
  question: string;
  doc_filter: string | null;
}): Promise<QueryResponse> {
  const response = await api.post<QueryResponse>("/query", payload);
  return response.data;
}

export async function fetchGraph(): Promise<GraphData> {
  const response = await api.get<GraphData>("/graph");
  return response.data;
}

export async function fetchSubgraph(nodes: string[]): Promise<GraphData> {
  const query = nodes.join(",");
  const response = await api.get<GraphData>("/graph/subgraph", {
    params: { nodes: query },
  });
  return response.data;
}

export async function fetchNodeDetails(nodeId: string): Promise<NodeDetail> {
  const response = await api.get<NodeDetail>(`/graph/node/${encodeURIComponent(nodeId)}`);
  return response.data;
}
