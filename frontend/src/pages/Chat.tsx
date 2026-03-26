import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, PanelLeftClose, PanelLeftOpen, Send, Waypoints } from 'lucide-react';
import { type ChatItem, queryDocument, useAppStore } from '../lib/utils';

export default function Chat() {
  const navigate = useNavigate();
  const endRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [docsCollapsed, setDocsCollapsed] = useState(false);

  const documents = useAppStore((state) => state.documents);
  const activeDocId = useAppStore((state) => state.activeDocId);
  const chatHistory = useAppStore((state) => state.chatHistory);
  const setActiveDoc = useAppStore((state) => state.setActiveDoc);
  const addUserMessage = useAppStore((state) => state.addUserMessage);
  const addAssistantMessage = useAppStore((state) => state.addAssistantMessage);
  const setHighlightedNodes = useAppStore((state) => state.setHighlightedNodes);

  const activeDoc = useMemo(
    () => documents.find((doc) => doc.id === activeDocId) ?? null,
    [documents, activeDocId]
  );

  const hasCompletedChat = useMemo(
    () => chatHistory.some((message) => message.role === 'assistant'),
    [chatHistory]
  );

  const renderSources = useCallback((message: ChatItem) => {
    const all = message.sources ?? [];
    if (all.length === 0) return null;

    const docBaseName = message.docFilter
      ? message.docFilter.split('/').pop()?.toLowerCase() ?? ''
      : '';
    const filtered = docBaseName
      ? all.filter((s) => s.file.toLowerCase().includes(docBaseName))
      : all;

    if (filtered.length === 0) return null;

    return (
      <details className="mt-3 rounded-lg border border-border/50 bg-surface-muted p-3">
        <summary className="text-xs font-bold text-primary cursor-pointer">Source Clauses</summary>
        <div className="mt-2 space-y-2">
          {filtered.map((source, index) => (
            <div key={`${source.file}-${index}`} className="text-xs text-outline">
              <p className="font-semibold text-foreground">{source.file}</p>
              <p>{source.excerpt}</p>
            </div>
          ))}
        </div>
      </details>
    );
  }, []);

  const submitQuestion = async (event: React.FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || isLoading) {
      return;
    }

    setInput('');
    addUserMessage(question);
    setIsLoading(true);

    try {
      const response = await queryDocument({
        question,
        doc_filter: activeDocId,
      });
      addAssistantMessage(response, activeDocId);
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }));
    } catch {
      addAssistantMessage({
        answer: 'Query failed. Ensure backend is running and indexed documents are ready.',
        risk_level: 'UNKNOWN',
        source_clauses: [],
        graph_nodes_involved: [],
      }, activeDocId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[calc(100vh-10rem)]">
      {!docsCollapsed && (
        <aside className="xl:col-span-3 glass-panel rounded-[1.5rem] p-5 shadow-[0_18px_36px_rgba(17,24,39,0.04)]">
        <h2 className="font-serif font-extrabold text-2xl text-primary">Active Documents</h2>
        <p className="text-sm text-outline mt-1 mb-5">Select a document for filtering answers</p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setActiveDoc(null)}
            className={[
              'w-full text-left rounded-xl p-3 border transition-all',
              activeDocId === null ? 'bg-emerald-50 border-emerald-200' : 'bg-white/85 border-transparent hover:border-border',
            ].join(' ')}
          >
            <p className="font-semibold text-foreground">All Documents</p>
            <p className="text-xs text-outline">doc_filter: null</p>
          </button>

          {documents.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => setActiveDoc(doc.id)}
              className={[
                'w-full text-left rounded-xl p-3 border transition-all',
                activeDocId === doc.id ? 'bg-emerald-50 border-emerald-200' : 'bg-white/85 border-transparent hover:border-border',
              ].join(' ')}
            >
              <p className="font-semibold text-foreground truncate">{doc.name}</p>
              <p className="text-xs text-outline">status: {doc.status}</p>
            </button>
          ))}
        </div>
        </aside>
      )}

      <section
        className={[
          'glass-panel rounded-[1.8rem] border border-white/60 shadow-[0_20px_40px_rgba(17,24,39,0.05)] flex flex-col overflow-hidden',
          docsCollapsed ? 'xl:col-span-12' : 'xl:col-span-9',
        ].join(' ')}
      >
        <div className="px-6 py-4 border-b border-border/50 bg-white/65 flex items-center justify-between">
          <div>
            <h3 className="font-serif font-extrabold text-xl text-primary">Query Analysis</h3>
            <p className="text-xs text-outline">
              {activeDoc ? `Filtering by ${activeDoc.name}` : 'Searching across all ready documents'}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 text-primary text-sm font-semibold">
            <button
              type="button"
              onClick={() => setDocsCollapsed((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/85 px-3 py-1.5 text-xs font-bold text-primary hover:bg-white transition-all"
            >
              {docsCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
              {docsCollapsed ? 'Show Docs' : 'Hide Docs'}
            </button>

            {hasCompletedChat && (
              <button
                type="button"
                onClick={() => navigate('/graph')}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/85 px-3 py-1.5 text-xs font-bold text-primary hover:bg-white transition-all"
              >
                <Waypoints size={14} />
                Graph
              </button>
            )}

            <span className="hidden sm:inline-flex items-center gap-2">
              <FileText size={16} />
              /query
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5">
          {chatHistory.length === 0 && (
            <div className="rounded-2xl border border-border/60 bg-white/80 p-6 text-outline text-sm">
              Ask your first question. Response will include risk level, source clauses, and graph nodes.
            </div>
          )}

          {chatHistory.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={[
                  'max-w-[84%] rounded-2xl p-4',
                  message.role === 'user'
                    ? 'bg-primary text-white rounded-tr-md'
                    : 'bg-white/90 border border-border/60 text-foreground rounded-tl-md',
                ].join(' ')}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>

                {message.role === 'assistant' && (
                  <>
                    {message.risk && (
                      <span
                        className={[
                          'inline-flex mt-3 text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded',
                          message.risk === 'HIGH'
                            ? 'bg-rose-100 text-rose-700'
                            : message.risk === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-800'
                              : message.risk === 'LOW'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-700',
                        ].join(' ')}
                      >
                        {message.risk}
                      </span>
                    )}

                    {renderSources(message)}

                    {message.graphNodes && message.graphNodes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setHighlightedNodes(message.graphNodes ?? []);
                          navigate('/graph');
                        }}
                        className="mt-3 text-xs font-bold text-primary hover:opacity-70"
                      >
                        View in Graph
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="rounded-2xl border border-border/60 bg-white/80 p-4 text-sm text-outline animate-pulse">
              Analyzing document...
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-5 bg-gradient-to-t from-white via-white/90 to-transparent border-t border-border/45">
          <form onSubmit={submitQuestion} className="max-w-4xl mx-auto relative group">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask PolicySattva anything about your documents..."
              className="w-full bg-white border border-border/60 rounded-full py-4 px-6 pr-16 shadow-[0_10px_24px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] text-foreground placeholder:text-outline/75 text-[15px]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-primary rounded-full flex items-center justify-center text-white shadow-md hover:brightness-110 disabled:bg-[#96a9a7] disabled:cursor-not-allowed transition-all"
            >
              <Send size={17} strokeWidth={2.3} className={input.trim() ? 'translate-x-[1px]' : ''} />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}