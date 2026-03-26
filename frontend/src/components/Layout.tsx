import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Upload', path: '/upload' },
    { label: 'Chat', path: '/chat' },
    { label: 'Graph', path: '/graph' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col font-sans">
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center items-center w-full px-4 pointer-events-none">
        <nav className="bg-white/80 backdrop-blur-xl rounded-full px-8 py-3 shadow-[0_20px_40px_rgba(17,24,39,0.03)] flex items-center gap-8 pointer-events-auto border border-white/50">
          <Link to="/" className="text-2xl font-extrabold tracking-tighter text-[#004541]">PolicySattva</Link>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative px-1 py-1 text-sm font-semibold transition-colors duration-300"
                >
                  <span className={cn(
                    "relative z-10",
                    isActive ? "text-[#004541]" : "text-gray-500 hover:text-[#004541]"
                  )}>
                    {link.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute left-0 right-0 -bottom-1 h-[2px] bg-[#004541] rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center pl-6 border-l border-gray-200">
            <button className="text-[#004541] hover:opacity-70 transition-opacity">
              <UserCircle size={24} strokeWidth={2} />
            </button>
          </div>
        </nav>
      </header>

      <main className="pt-28 pb-16 px-4 md:px-8 lg:px-14 mx-auto w-full max-w-[1440px] flex-1">{children}</main>
    </div>
  );
}
