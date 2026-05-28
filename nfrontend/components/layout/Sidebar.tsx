"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Sparkles,
  Network,
  ShieldCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  LogOut,
  Download,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", href: "/", Icon: Home },
  { id: "analysis", label: "AI Analysis", href: "/analysis", Icon: Sparkles },
  { id: "graph", label: "Knowledge Graph", href: "/graph", Icon: Network },
  { id: "compliance", label: "Compliance", href: "/compliance", Icon: ShieldCheck },
];

const GRAPH_METRICS = [
  { label: "Active Nodes", value: "1.2k" },
  { label: "Relations", value: "8.4k" },
];

const CONCEPT_CLUSTERS = [
  { id: "financial", label: "Financial", color: "#bdf126" },
  { id: "risk", label: "Risk", color: "#ba1a1a" },
  { id: "operational", label: "Operational", color: "#1a1c1b" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const s = {
    surface: "#f9f9f7",
    containerLow: "#f4f4f2",
    lime: "#bdf126",
    brown: "#6a5c51",
    onSurface: "#1a1c1b",
    onSurfaceVariant: "#444748",
    outline: "#747878",
    border: "rgba(106,92,81,0.10)",
    font: "'Hanken Grotesk', system-ui, sans-serif",
    radius: "0.25rem",
  };

  if (collapsed) {
    return (
      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100%",
          zIndex: 30,
          width: 48,
          background: s.surface,
          borderRight: `1px solid ${s.border}`,
          fontFamily: s.font,
          transition: "width 0.2s",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <button
          onClick={onToggle}
          style={{
            width: 48,
            height: 48,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: s.brown,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: `1px solid ${s.border}`,
            flexShrink: 0,
          }}
          aria-label="Expand sidebar"
        >
          <ChevronRight size={15} />
        </button>

        <nav style={{ paddingTop: 6, width: "100%" }}>
          {NAV_ITEMS.map(({ id, href, Icon }) => {
            const isActive =
              pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link key={id} href={href} style={{ textDecoration: "none", display: "block" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 40,
                    margin: "1px 6px",
                    borderRadius: s.radius,
                    background: isActive ? s.lime : "transparent",
                    color: isActive ? s.onSurface : s.onSurfaceVariant,
                    cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background = s.containerLow;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                  title={NAV_ITEMS.find((n) => n.href === href)?.label}
                >
                  <Icon size={15} />
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>
    );
  }

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100%",
        zIndex: 30,
        width: 200,
        background: s.surface,
        borderRight: `1px solid ${s.border}`,
        fontFamily: s.font,
        transition: "width 0.2s",
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "10px 10px 10px 12px",
          borderBottom: `1px solid ${s.border}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <Building2 size={18} color={s.brown} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: s.onSurface,
              lineHeight: 1.3,
            }}
          >
            Case Workspace
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: s.outline,
              lineHeight: 1.4,
            }}
          >
            V2.4 INDEXING
          </div>
        </div>
        <button
          onClick={onToggle}
          style={{
            width: 24,
            height: 24,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: s.brown,
            borderRadius: s.radius,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          aria-label="Collapse sidebar"
        >
          <ChevronLeft size={15} />
        </button>
      </div>

      <nav style={{ paddingTop: 6, paddingBottom: 4, flexShrink: 0 }}>
        {NAV_ITEMS.map(({ id, label, href, Icon }) => {
          const isActive =
            pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={id} href={href} style={{ textDecoration: "none", display: "block", margin: "1px 6px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "8px 10px",
                  borderRadius: s.radius,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  background: isActive ? s.lime : "transparent",
                  color: isActive ? s.onSurface : s.brown,
                  transition: "background 0.12s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.background = "#eeeeec";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <Icon size={14} />
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "8px 12px 4px", flexShrink: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: s.outline,
            paddingBottom: 6,
          }}
        >
          GRAPH METRICS
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {GRAPH_METRICS.map((m) => (
            <div
              key={m.label}
              style={{
                flex: 1,
                padding: "8px",
                background: "#ffffff",
                border: `1px solid ${s.border}`,
                borderRadius: s.radius,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: s.onSurface,
                  lineHeight: 1.1,
                }}
              >
                {m.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: s.outline,
                  marginTop: 2,
                  lineHeight: 1.3,
                }}
              >
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "8px 12px 6px", flexShrink: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: s.outline,
            paddingBottom: 6,
          }}
        >
          CONCEPT CLUSTERS
        </div>
        {CONCEPT_CLUSTERS.map((c) => (
          <label
            key={c.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 0",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                border: `1.5px solid ${s.border}`,
                borderRadius: 2,
                background: s.lime,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                <path
                  d="M1 3L3 5L7 1"
                  stroke={s.onSurface}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: s.onSurface,
                flex: 1,
              }}
            >
              {c.label}
            </span>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: c.color,
                flexShrink: 0,
              }}
            />
          </label>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ padding: "0 12px 8px", flexShrink: 0 }}>
        <button
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "8px 0",
            background: s.onSurface,
            color: "#ffffff",
            border: "none",
            borderRadius: s.radius,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: s.font,
          }}
        >
          <Download size={13} />
          Export Report
        </button>
      </div>

      <div
        style={{
          borderTop: `1px solid ${s.border}`,
          paddingTop: 4,
          paddingBottom: 6,
          flexShrink: 0,
        }}
      >
        {[
          { label: "Help Center", Icon: HelpCircle, href: "#" },
          { label: "Log Out", Icon: LogOut, href: "#" },
        ].map(({ label, Icon, href }) => (
          <Link
            key={label}
            href={href}
            style={{ textDecoration: "none", display: "block", margin: "1px 6px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: s.brown,
                borderRadius: s.radius,
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget as HTMLElement).style.background = "#eeeeec"
              }
              onMouseLeave={(e) =>
                (e.currentTarget as HTMLElement).style.background = "transparent"
              }
            >
              <Icon size={13} />
              {label}
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
