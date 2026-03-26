import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Upload } from 'lucide-react';
import {
  getIngestStatus,
  ingestDocument,
  type DocumentStatus,
  useAppStore,
} from '../lib/utils';

export default function Landing() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const documents = useAppStore((state) => state.documents);
  const activeDocId = useAppStore((state) => state.activeDocId);
  const upsertDocument = useAppStore((state) => state.upsertDocument);
  const setDocumentStatus = useAppStore((state) => state.setDocumentStatus);
  const setActiveDoc = useAppStore((state) => state.setActiveDoc);

  useEffect(() => {
    const indexingDocs = documents.filter((doc) => doc.status === 'indexing');
    if (!indexingDocs.length) {
      return;
    }

    const timer = setInterval(async () => {
      await Promise.all(
        indexingDocs.map(async (doc) => {
          try {
            const status = await getIngestStatus(doc.id);
            setDocumentStatus(doc.id, status);
          } catch {
            setDocumentStatus(doc.id, 'failed');
          }
        })
      );
    }, 3000);

    return () => clearInterval(timer);
  }, [documents, setDocumentStatus]);

  const handleUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are supported.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const { doc_id } = await ingestDocument(file);
      upsertDocument({ id: doc_id, name: file.name, status: 'indexing' });
      setActiveDoc(doc_id);
    } catch {
      setUploadError('Upload failed. Make sure backend is running on port 8000.');
    } finally {
      setIsUploading(false);
    }
  };

  const statusStyles: Record<DocumentStatus, string> = {
    indexing: 'bg-amber-100 text-amber-800',
    ready: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-rose-100 text-rose-800',
  };

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[calc(100vh-10rem)]">
      <section className="lg:col-span-7 space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-serif font-extrabold tracking-tight text-foreground leading-[1.05]"
        >
          Upload. Index. Ask.
        </motion.h1>
        <p className="text-outline text-lg max-w-2xl">
          Upload a PDF, wait for indexing, then move to chat with grounded answers, risk badges, and source clauses.
        </p>

        <div className="glass-panel rounded-[1.8rem] p-7 border border-white/60 shadow-[0_20px_40px_rgba(17,24,39,0.05)]">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed border-border bg-white/70 p-12 text-center hover:border-primary hover:bg-white transition-all"
            disabled={isUploading}
          >
            <Upload className="mx-auto text-primary" size={30} />
            <p className="mt-3 text-foreground font-bold text-lg">
              {isUploading ? 'Uploading and starting indexing...' : 'Drop PDF here or click to upload'}
            </p>
            <p className="text-sm text-outline mt-1">PDF only • backend /ingest</p>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleUpload(file);
              }
              event.target.value = '';
            }}
          />

          {uploadError && <p className="text-danger text-sm mt-4">{uploadError}</p>}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/chat')}
              className="h-12 px-6 rounded-full bg-primary text-white font-bold flex items-center gap-2 hover:brightness-110 transition-all"
            >
              Ask Questions
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/graph')}
              className="h-12 px-6 rounded-full border border-border text-primary font-bold hover:bg-surface-muted transition-all"
            >
              Open Graph
            </button>
          </div>
        </div>
      </section>

      <aside className="lg:col-span-5 glass-panel rounded-[1.8rem] p-6 border border-white/60 shadow-[0_20px_40px_rgba(17,24,39,0.05)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-serif font-extrabold text-primary">Documents</h2>
          <span className="text-sm text-outline">{documents.length} total</span>
        </div>

        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {documents.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => setActiveDoc(doc.id)}
              className={[
                'w-full text-left rounded-xl p-4 border transition-all',
                activeDocId === doc.id
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-white/75 border-transparent hover:border-border',
              ].join(' ')}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{doc.name}</p>
                  <p className="text-xs text-outline mt-1">{doc.id}</p>
                </div>
                <span className={`text-[11px] px-2 py-1 rounded-full font-bold uppercase tracking-wide ${statusStyles[doc.status]}`}>
                  {doc.status}
                </span>
              </div>
            </button>
          ))}
        </div>

        {activeDocId && (
          <button
            type="button"
            onClick={() => navigate('/chat')}
            className="mt-5 w-full h-12 rounded-full bg-primary text-white font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all"
          >
            <FileText size={16} />
            Ask Questions About Active Doc
          </button>
        )}
      </aside>
    </div>
  );
}