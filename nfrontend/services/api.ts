import type {
  UploadedDocument,
  AnalysisSession,
  AnalysisCard,
  ChatMessage,
  IndexingState,
  GraphNode,
  GraphEdge,
  QueryResponse,
  IngestResponse,
  StatusResponse,
  BackendGraphResponse,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchAPI<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json();
}

export const documentService = {
  upload: async (file: File): Promise<UploadedDocument> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/ingest`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Upload error ${res.status}: ${body}`);
    }
    const data: IngestResponse = await res.json();
    return {
      id: data.doc_id,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: data.status === "indexing" ? "indexing" : "ready",
      progress: data.status === "indexing" ? 0 : 100,
    };
  },

  list: async (): Promise<UploadedDocument[]> => {
    return [];
  },

  get: async (id: string): Promise<UploadedDocument | null> => {
    void id;
    return null;
  },

  delete: async (id: string): Promise<void> => {
    void id;
  },
};

export const analysisService = {
  getSession: async (sessionId: string): Promise<AnalysisSession | null> => {
    void sessionId;
    return null;
  },

  sendMessage: async (
    sessionId: string,
    content: string,
    docFilter?: string | null
  ): Promise<ChatMessage> => {
    const body = { question: content, doc_filter: docFilter ?? null };
    const data: QueryResponse = await fetchAPI("/query", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const riskLevel = data.risk_level?.toLowerCase() as
      | "critical"
      | "elevated"
      | "standard"
      | "none" | undefined;
    const validLevel = riskLevel && ["critical", "elevated", "standard", "none"].includes(riskLevel)
      ? riskLevel
      : "standard";

    const analysisCard: AnalysisCard | undefined =
      data.source_clauses.length > 0 || data.risk_level
        ? {
            id: crypto.randomUUID(),
            title: data.risk_level === "HIGH" ? "Critical Risk Detected"
              : data.risk_level === "MEDIUM" ? "Elevated Risk Found"
              : "Analysis Result",
            risk: {
              level: validLevel,
              label: data.risk_level === "HIGH" ? "High Risk"
                : data.risk_level === "MEDIUM" ? "Medium Risk"
                : "Standard",
            },
            summary: data.source_clauses.length > 0
              ? data.source_clauses.map((sc) => `"${sc.excerpt}" — ${sc.file}`).join("\n")
              : data.answer.slice(0, 300),
            sourceClauses: data.source_clauses.map((sc, i) => ({
              id: `sc-${i}`,
              title: `Source — ${sc.file}`,
              pageRef: "",
              excerpt: sc.excerpt,
            })),
            createdAt: new Date().toISOString(),
          }
        : undefined;

    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: data.answer,
      analysisCard: analysisCard,
      timestamp: new Date().toISOString(),
    };
  },

  getCards: async (sessionId: string): Promise<AnalysisCard[]> => {
    void sessionId;
    return [];
  },
};

export const indexingService = {
  getStatus: async (documentId: string): Promise<StatusResponse | null> => {
    try {
      return await fetchAPI<StatusResponse>(`/ingest/status/${encodeURIComponent(documentId)}`);
    } catch {
      return null;
    }
  },
};

export const graphService = {
  getNodes: async (_workspaceId: string): Promise<GraphNode[]> => {
    const data: BackendGraphResponse = await fetchAPI("/graph");
    return data.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      type: (n.type === "entity" ? "document" : n.type) as GraphNode["type"],
      risk: "standard" as const,
      x: 50 + Math.random() * 40 - 20,
      y: 50 + Math.random() * 40 - 20,
    }));
  },

  getEdges: async (_workspaceId: string): Promise<GraphEdge[]> => {
    const data: BackendGraphResponse = await fetchAPI("/graph");
    return data.edges.map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      weight: 0.6,
      label: e.label,
    }));
  },

  getMetrics: async (_workspaceId: string): Promise<{
    activeNodes: number; relations: number; risksSet: number; totalTokens: number;
  } | null> => {
    try {
      const data: BackendGraphResponse = await fetchAPI("/graph");
      return {
        activeNodes: data.stats.node_count,
        relations: data.stats.edge_count,
        risksSet: 0,
        totalTokens: 0,
      };
    } catch {
      return null;
    }
  },

  exportReport: async (workspaceId: string): Promise<{ downloadUrl: string }> => {
    void workspaceId;
    return { downloadUrl: "#" };
  },
};
