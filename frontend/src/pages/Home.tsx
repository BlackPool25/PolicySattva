import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="mt-8 space-y-14">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-white via-[#eef8f6] to-[#dff1ee] p-8 md:p-12 lg:p-16 shadow-[0_28px_60px_rgba(17,24,39,0.08)]">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#2e8c82]/10 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-[#004541]/10 blur-3xl" />

        <div className="relative max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center rounded-full border border-[#b8d9d3] bg-white/70 px-4 py-1 text-xs font-bold uppercase tracking-[0.15em] text-primary"
          >
            Legal Intelligence, Simplified
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-5 font-serif text-4xl font-extrabold leading-tight text-[#0f3f3b] md:text-6xl"
          >
            Understand complex policies before you click Agree.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 max-w-2xl text-base text-[#355752] md:text-lg"
          >
            Upload Terms of Service or privacy policies, ask plain-English questions, get risk levels with source
            clauses, and inspect relationships in a visual knowledge graph.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <button
              type="button"
              onClick={() => navigate('/upload')}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-bold text-white transition-all hover:brightness-110"
            >
              Start With Upload
              <ArrowRight size={16} />
            </button>
            <Link
              to="/chat"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-[#95bdb6] bg-white/85 px-6 font-bold text-primary transition-all hover:bg-white"
            >
              Open Chat
              <MessageCircle size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
