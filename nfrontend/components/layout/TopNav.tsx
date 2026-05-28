"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Settings, Plus } from "lucide-react";

const NAV_LINKS = [
  { label: "Dashboard", href: "/" },
  { label: "AI Analysis", href: "/analysis" },
  { label: "Knowledge Graph", href: "/graph" },
  { label: "Compliance", href: "/compliance" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        height: 52,
        background: "#ffffff",
        borderBottom: "1px solid rgba(106,92,81,0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          maxWidth: 1200,
          padding: "0 24px",
          gap: 8,
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              background: "#bdf126",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M2 4 L6 10 L10 4"
                stroke="#1a1c1b"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "'Literata', Georgia, serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#1a1c1b",
            }}
          >
            PolicySattva
          </span>
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flex: 1,
            justifyContent: "center",
          }}
        >
          {NAV_LINKS.map(({ label, href }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            const activeStyle = isActive
              ? { color: "#1a1c1b", borderBottom: "2px solid #bdf126" }
              : { color: "#6a5c51", borderBottom: "2px solid transparent" };

            return (
              <Link
                key={label}
                href={href}
                style={{ textDecoration: "none" }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "5px 12px",
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    borderRadius: 4,
                    ...activeStyle,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <Link href="/indexing" style={{ textDecoration: "none" }}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 4,
                background: "#bdf126",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#1a1c1b",
                fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
              }}
            >
              <Plus size={13} />
              New Analysis
            </button>
          </Link>
          <button
            style={{
              padding: 6,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#6a5c51",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Notifications"
          >
            <Bell size={16} />
          </button>
          <button
            style={{
              padding: 6,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#6a5c51",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
