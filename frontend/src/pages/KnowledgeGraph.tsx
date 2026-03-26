import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MarkerType,
  useReactFlow,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from '@xyflow/react';
import { Download, Focus, X, ZoomIn, ZoomOut } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import { fetchGraph, fetchNodeDetails, fetchSubgraph, type NodeDetail, useAppStore } from '../lib/utils';

function buildRadialNodes(rawNodes: Array<{ id: string; label: string; type?: string }>, highlighted: Set<string>): Node[] {
  const radius = 280;
  const centerX = 460;
  const centerY = 320;
  return rawNodes.map((node, index) => {
    const angle = (index / Math.max(rawNodes.length, 1)) * Math.PI * 2;
    const isHighlighted = highlighted.has(node.id);
    return {
      id: node.id,
      position: {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      },
      data: { label: node.label || node.id },
      style: {
        borderRadius: 999,
        border: `1px solid ${isHighlighted ? '#115e59' : '#d7dfde'}`,
        background: isHighlighted ? '#ddf5f2' : '#ffffff',
        color: '#1f2d2c',
        fontWeight: 700,
        padding: '12px 16px',
      },
    };
  });
}

type FlowInnerProps = {
  nodes: Node[];
  edges: Edge[];
  highlightedNodes: string[];
  isLoading: boolean;
  stats: { node_count: number; edge_count: number };
};

function FlowInner({ nodes, edges, highlightedNodes, isLoading, stats }: FlowInnerProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeDetail, setNodeDetail] = useState<NodeDetail | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  const handleNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNodeId(node.id);
    setNodeDetail(null);
    setIsFetchingDetail(true);
    fetchNodeDetails(node.id)
      .then((detail) => setNodeDetail(detail))
      .catch(() =>
        setNodeDetail({
          id: node.id,
          label: node.id,
          description: 'Details unavailable.',
          type: 'entity',
          source_files: [],
        })
      )
      .finally(() => setIsFetchingDetail(false));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodeId(null);
    setNodeDetail(null);
  }, []);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        onNodeClick={handleNodeClick}
        className="[&_.react-flow__attribution]:hidden"
      >
        <Background gap={38} size={1} color="#e1e3e4" />
      </ReactFlow>

      <aside className="absolute right-6 top-1/2 -translate-y-1/2 z-20 glass-panel rounded-3xl p-5 w-[290px] shadow-[0_16px_32px_rgba(17,24,39,0.05)] hidden md:block">
        {selectedNodeId ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-extrabold text-xl text-primary">Entity Detail</h3>
              <button
                type="button"
                onClick={clearSelection}
                className="text-outline hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {isFetchingDetail ? (
              <p className="mt-4 text-sm text-outline animate-pulse">Loading details…</p>
            ) : nodeDetail ? (
              <div className="mt-4 space-y-3 text-sm">
                <p className="font-bold text-foreground break-words">{nodeDetail.label}</p>
                {nodeDetail.type && nodeDetail.type !== 'entity' && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-primary px-2 py-1 rounded">
                    {nodeDetail.type}
                  </span>
                )}
                <p className="text-outline leading-relaxed">
                  {nodeDetail.description || 'No description available.'}
                </p>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <h3 className="font-serif font-extrabold text-xl text-primary">Graph Insights</h3>
            <div className="mt-4 space-y-2 text-sm text-outline">
              <p>{stats.node_count} entities</p>
              <p>{stats.edge_count} relationships</p>
              {highlightedNodes.length > 0 && (
                <p className="text-primary font-semibold">Subgraph mode active</p>
              )}
            </div>
            <button
              type="button"
              className="mt-6 w-full rounded-full bg-primary text-white py-3 text-xs font-bold tracking-[0.14em] uppercase flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            >
              <Download size={14} />
              Export Analysis
            </button>
          </>
        )}
      </aside>

      <div className="absolute right-8 bottom-8 z-20 glass-panel rounded-full p-2 flex flex-col gap-2 shadow-lg">
        <button
          type="button"
          onClick={() => zoomIn({ duration: 300 })}
          className="w-10 h-10 rounded-full hover:bg-surface-muted flex items-center justify-center text-primary"
        >
          <ZoomIn size={16} />
        </button>
        <button
          type="button"
          onClick={() => zoomOut({ duration: 300 })}
          className="w-10 h-10 rounded-full hover:bg-surface-muted flex items-center justify-center text-primary"
        >
          <ZoomOut size={16} />
        </button>
        <div className="w-6 h-px bg-border mx-auto" />
        <button
          type="button"
          onClick={() => fitView({ duration: 300 })}
          className="w-10 h-10 rounded-full hover:bg-surface-muted flex items-center justify-center text-primary"
        >
          <Focus size={16} />
        </button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-30 bg-white/60 backdrop-blur-[2px] flex items-center justify-center text-primary font-semibold">
          Loading graph data...
        </div>
      )}
    </>
  );
}

export default function KnowledgeGraph() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const graphData = useAppStore((state) => state.graphData);
  const highlightedNodes = useAppStore((state) => state.highlightedNodes);
  const chatHistory = useAppStore((state) => state.chatHistory);
  const setGraphData = useAppStore((state) => state.setGraphData);

  const hasCompletedChat = useMemo(
    () => chatHistory.some((message) => message.role === 'assistant'),
    [chatHistory]
  );

  // Nodes from the most recent assistant message that included graph context.
  // Used as a fallback when the user navigates directly to /graph without
  // clicking "View in Graph" — so the page always shows a focused subgraph
  // rather than the full 200+ node graph.
  const lastQueryNodes = useMemo(() => {
    const last = [...chatHistory]
      .reverse()
      .find((m) => m.role === 'assistant' && m.graphNodes && m.graphNodes.length > 0);
    return last?.graphNodes ?? [];
  }, [chatHistory]);

  // Explicitly highlighted nodes take priority; fall back to last query's nodes.
  const effectiveNodes = highlightedNodes.length > 0 ? highlightedNodes : lastQueryNodes;

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!hasCompletedChat) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const nextData =
          effectiveNodes.length > 0
            ? await fetchSubgraph(effectiveNodes)
            : await fetchGraph();
        if (mounted) {
          setGraphData(nextData);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [hasCompletedChat, effectiveNodes, setGraphData]);

  if (!hasCompletedChat) {
    return (
      <div className="h-[calc(100vh-10rem)] rounded-[2rem] border border-white/50 shadow-[0_20px_40px_rgba(17,24,39,0.05)] glass-panel p-8 flex items-center justify-center">
        <div className="max-w-xl text-center">
          <h2 className="font-serif font-extrabold text-3xl text-primary">Complete chat to unlock graph</h2>
          <p className="mt-3 text-outline">
            The knowledge graph appears only after at least one chat answer is generated.
          </p>
          <button
            type="button"
            onClick={() => navigate('/chat')}
            className="mt-6 h-11 px-6 rounded-full bg-primary text-white font-bold hover:brightness-110 transition-all"
          >
            Go to Chat
          </button>
        </div>
      </div>
    );
  }

  const highlightedSet = useMemo(() => new Set(effectiveNodes), [effectiveNodes]);

  const nodes: Node[] = useMemo(
    () => buildRadialNodes(graphData.nodes, highlightedSet),
    [graphData.nodes, highlightedSet]
  );

  const edges: Edge[] = useMemo(
    () =>
      graphData.edges.map((edge, index) => {
        const emphasized = highlightedSet.has(edge.source) || highlightedSet.has(edge.target);
        return {
          id: `${edge.source}-${edge.target}-${index}`,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: emphasized ? '#115e59' : '#9eb2b0',
          },
          style: {
            stroke: emphasized ? '#115e59' : '#b8c6c4',
            strokeWidth: emphasized ? 2 : 1,
          },
        };
      }),
    [graphData.edges, highlightedSet]
  );

  return (
    <div className="relative h-[calc(100vh-10rem)] rounded-[2rem] overflow-hidden border border-white/50 shadow-[0_20px_40px_rgba(17,24,39,0.05)] bg-[radial-gradient(circle_at_2px_2px,#e1e3e4_1px,transparent_0)] [background-size:38px_38px]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[18%] w-[24rem] h-[24rem] rounded-full bg-emerald-200/30 blur-[110px]" />
        <div className="absolute bottom-[8%] right-[20%] w-[18rem] h-[18rem] rounded-full bg-slate-200/40 blur-[100px]" />
      </div>
      <ReactFlowProvider>
        <FlowInner
          nodes={nodes}
          edges={edges}
          highlightedNodes={effectiveNodes}
          isLoading={isLoading}
          stats={graphData.stats}
        />
      </ReactFlowProvider>
    </div>
  );
}
