"use client";

import TopNav from "./TopNav";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      background: "#f9f9f7",
    }}>
      <TopNav />
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }} className={className}>
        {children}
      </main>
    </div>
  );
}
