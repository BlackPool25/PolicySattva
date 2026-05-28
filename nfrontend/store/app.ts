import { create } from "zustand";
import type { UploadedDocument, IndexingState, GraphNode, GraphEdge, ChatMessage } from "@/types";

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  activeDocument: UploadedDocument | null;
  setActiveDocument: (doc: UploadedDocument | null) => void;

  indexingState: IndexingState | null;
  setIndexingState: (state: IndexingState | null) => void;

  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;

  graphNodes: GraphNode[];
  setGraphNodes: (nodes: GraphNode[]) => void;
  graphEdges: GraphEdge[];
  setGraphEdges: (edges: GraphEdge[]) => void;

  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;

  isQuerying: boolean;
  setIsQuerying: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  activeDocument: null,
  setActiveDocument: (doc) => set({ activeDocument: doc }),

  indexingState: null,
  setIndexingState: (state) => set({ indexingState: state }),

  activeSessionId: null,
  setActiveSessionId: (id) => set({ activeSessionId: id }),

  graphNodes: [],
  setGraphNodes: (nodes) => set({ graphNodes: nodes }),
  graphEdges: [],
  setGraphEdges: (edges) => set({ graphEdges: edges }),

  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),

  isQuerying: false,
  setIsQuerying: (v) => set({ isQuerying: v }),
}));
