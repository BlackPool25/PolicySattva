export type DocumentStatus =
  | "idle"
  | "uploading"
  | "indexing"
  | "ready"
  | "error";

export type RiskLevel = "critical" | "elevated" | "standard" | "none";

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  status: DocumentStatus;
  progress?: number;
  pageCount?: number;
  tokenCount?: number;
}

export interface RiskTag {
  level: RiskLevel;
  label: string;
}

export interface SourceClause {
  id: string;
  title: string;
  pageRef: string;
  excerpt: string;
}

export interface AnalysisCard {
  id: string;
  title: string;
  risk: RiskTag;
  summary: string;
  sourceClauses: SourceClause[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  analysisCard?: AnalysisCard;
  timestamp: string;
}

export interface AnalysisSession {
  id: string;
  documentId: string;
  documentName: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export type IndexingStep =
  | "extracting"
  | "identifying"
  | "scanning"
  | "complete";

export interface IndexingState {
  step: IndexingStep;
  progress: number;
  label: string;
  documentName: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "document" | "clause" | "risk" | "financial" | "entity";
  risk: RiskLevel;
  x: number;
  y: number;
  isCenter?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight?: number;
  label?: string;
}

export interface GraphMetrics {
  activeNodes: number;
  relations: number;
  risksSet: number;
  totalTokens: number;
}

export interface ConceptCluster {
  id: string;
  label: string;
  count?: number;
  color: string;
  active: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

export interface QueryRequest {
  question: string;
  doc_filter?: string | null;
}

export interface BackendSourceClause {
  file: string;
  excerpt: string;
}

export interface QueryResponse {
  answer: string;
  risk_level: string;
  source_clauses: BackendSourceClause[];
  graph_nodes_involved: string[];
}

export interface IngestResponse {
  status: string;
  doc_id: string;
  message: string;
}

export interface StatusResponse {
  doc_id: string;
  status: string;
}

export interface BackendGraphNode {
  id: string;
  label: string;
  type: string;
}

export interface BackendGraphEdge {
  source: string;
  target: string;
  label: string;
}

export interface BackendGraphStats {
  node_count: number;
  edge_count: number;
}

export interface BackendGraphResponse {
  nodes: BackendGraphNode[];
  edges: BackendGraphEdge[];
  stats: BackendGraphStats;
}

export interface BackendGraphNodeDetail {
  id: string;
  label: string;
  description: string;
  type: string;
  source_files: string[];
}
