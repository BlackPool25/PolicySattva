"use client";

/**
 * Decorative medieval/botanical corner ornaments.
 * Matches the reference screens: scrolls, leaves, scholar figures at corners.
 */

interface OrnamentalCornersProps {
  opacity?: number;
  size?: "sm" | "md" | "lg";
}

const SIZES = { sm: 140, md: 190, lg: 240 };

/* ─── Top-Left: scroll + foliage ─────────────────────────────────────────── */
function TopLeftOrnament() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      {/* Corner arc frame */}
      <path d="M4 4 C4 4, 60 10, 100 40 C140 70, 170 120, 180 196" stroke="#6a5c51" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M14 14 C14 14, 60 22, 96 50 C132 78, 158 128, 164 196" stroke="#6a5c51" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3"/>
      {/* Scroll */}
      <ellipse cx="34" cy="28" rx="22" ry="14" stroke="#6a5c51" strokeWidth="1.5" fill="#f5ede0" fillOpacity="0.7" opacity="0.85"/>
      <ellipse cx="34" cy="28" rx="16" ry="9" stroke="#6a5c51" strokeWidth="1" fill="none" opacity="0.5"/>
      <line x1="22" y1="28" x2="46" y2="28" stroke="#6a5c51" strokeWidth="0.8" opacity="0.5"/>
      <line x1="25" y1="24" x2="43" y2="24" stroke="#6a5c51" strokeWidth="0.7" opacity="0.4"/>
      <line x1="25" y1="32" x2="43" y2="32" stroke="#6a5c51" strokeWidth="0.7" opacity="0.4"/>
      {/* Scroll handles */}
      <ellipse cx="13" cy="28" rx="7" ry="14" stroke="#6a5c51" strokeWidth="1.2" fill="#e8d9c0" fillOpacity="0.8" opacity="0.8"/>
      <ellipse cx="55" cy="28" rx="7" ry="14" stroke="#6a5c51" strokeWidth="1.2" fill="#e8d9c0" fillOpacity="0.8" opacity="0.8"/>
      {/* Foliage stems */}
      <path d="M60 80 C55 65, 70 55, 80 68" stroke="#7a9a40" strokeWidth="1.2" fill="none" opacity="0.7"/>
      <path d="M80 68 C85 58, 100 62, 95 75" stroke="#7a9a40" strokeWidth="1.2" fill="none" opacity="0.7"/>
      {/* Leaves */}
      <path d="M62 72 C56 64, 68 58, 72 68 C76 78, 66 82, 62 72Z" fill="#8faa50" fillOpacity="0.4" stroke="#6B8E23" strokeWidth="0.8" opacity="0.75"/>
      <path d="M82 62 C76 54, 90 50, 92 62 C94 74, 84 76, 82 62Z" fill="#8faa50" fillOpacity="0.4" stroke="#6B8E23" strokeWidth="0.8" opacity="0.75"/>
      <path d="M95 78 C88 70, 103 67, 104 79 C105 91, 97 90, 95 78Z" fill="#8faa50" fillOpacity="0.35" stroke="#6B8E23" strokeWidth="0.8" opacity="0.65"/>
      {/* Corner rosette */}
      <circle cx="10" cy="10" r="5" stroke="#6a5c51" strokeWidth="1.2" fill="none" opacity="0.5"/>
      <circle cx="10" cy="10" r="2.5" fill="#6a5c51" fillOpacity="0.3"/>
      {/* Cross-hatch detail */}
      <line x1="40" y1="55" x2="55" y2="40" stroke="#6a5c51" strokeWidth="0.7" opacity="0.25"/>
      <line x1="50" y1="65" x2="65" y2="50" stroke="#6a5c51" strokeWidth="0.7" opacity="0.25"/>
    </svg>
  );
}

/* ─── Top-Right: Scholar/figure reading scroll ───────────────────────────── */
function TopRightOrnament() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", transform: "scaleX(-1)" }}>
      {/* Corner arc frame */}
      <path d="M4 4 C4 4, 60 10, 100 40 C140 70, 170 120, 180 196" stroke="#6a5c51" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M14 14 C14 14, 60 22, 96 50 C132 78, 158 128, 164 196" stroke="#6a5c51" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3"/>
      {/* Seated scholar silhouette */}
      {/* Body */}
      <ellipse cx="40" cy="110" rx="18" ry="28" fill="#c4a87a" fillOpacity="0.35" stroke="#6a5c51" strokeWidth="1" opacity="0.7"/>
      {/* Head */}
      <circle cx="40" cy="80" r="10" fill="#d4b896" fillOpacity="0.5" stroke="#6a5c51" strokeWidth="1" opacity="0.8"/>
      {/* Robe/cloak detail */}
      <path d="M24 120 C22 138, 30 148, 40 150 C50 152, 58 138, 56 120" stroke="#6a5c51" strokeWidth="0.8" fill="#c4a87a" fillOpacity="0.2" opacity="0.6"/>
      {/* Arm holding scroll */}
      <path d="M52 100 C62 92, 74 88, 80 82" stroke="#6a5c51" strokeWidth="1.2" fill="none" opacity="0.7"/>
      {/* Mini scroll */}
      <ellipse cx="84" cy="80" rx="12" ry="8" stroke="#6a5c51" strokeWidth="1" fill="#f5ede0" fillOpacity="0.8" opacity="0.8"/>
      <line x1="75" y1="80" x2="93" y2="80" stroke="#6a5c51" strokeWidth="0.7" opacity="0.5"/>
      <line x1="77" y1="77" x2="91" y2="77" stroke="#6a5c51" strokeWidth="0.6" opacity="0.4"/>
      {/* Foliage at base */}
      <path d="M20 145 C14 132, 28 126, 34 138" stroke="#7a9a40" strokeWidth="1" fill="none" opacity="0.6"/>
      <path d="M26 140 C20 130, 36 126, 38 138 C40 150, 30 152, 26 140Z" fill="#8faa50" fillOpacity="0.4" stroke="#6B8E23" strokeWidth="0.7" opacity="0.7"/>
      {/* Corner rosette */}
      <circle cx="10" cy="10" r="5" stroke="#6a5c51" strokeWidth="1.2" fill="none" opacity="0.5"/>
      <circle cx="10" cy="10" r="2.5" fill="#6a5c51" fillOpacity="0.3"/>
    </svg>
  );
}

/* ─── Bottom-Left: Scholar + scales/justice figure ───────────────────────── */
function BottomLeftOrnament() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", transform: "scaleY(-1)" }}>
      {/* Corner arc frame */}
      <path d="M4 4 C4 4, 60 10, 100 40 C140 70, 170 120, 180 196" stroke="#6a5c51" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M14 14 C14 14, 60 22, 96 50 C132 78, 158 128, 164 196" stroke="#6a5c51" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3"/>
      {/* Seated scholar with scroll on knee */}
      <ellipse cx="38" cy="110" rx="16" ry="25" fill="#c4a87a" fillOpacity="0.35" stroke="#6a5c51" strokeWidth="1" opacity="0.7"/>
      <circle cx="38" cy="83" r="10" fill="#d4b896" fillOpacity="0.5" stroke="#6a5c51" strokeWidth="1" opacity="0.8"/>
      {/* Scroll on lap */}
      <rect x="26" y="106" width="26" height="16" rx="2" fill="#f5ede0" fillOpacity="0.8" stroke="#6a5c51" strokeWidth="1" opacity="0.75"/>
      <line x1="28" y1="111" x2="50" y2="111" stroke="#6a5c51" strokeWidth="0.7" opacity="0.5"/>
      <line x1="28" y1="115" x2="50" y2="115" stroke="#6a5c51" strokeWidth="0.7" opacity="0.4"/>
      {/* Foliage */}
      <path d="M55 135 C60 120, 75 118, 78 132" stroke="#7a9a40" strokeWidth="1.2" fill="none" opacity="0.6"/>
      <path d="M58 128 C52 118, 68 112, 70 125 C72 138, 62 140, 58 128Z" fill="#8faa50" fillOpacity="0.4" stroke="#6B8E23" strokeWidth="0.8" opacity="0.7"/>
      <path d="M76 132 C70 122, 86 119, 87 131 C88 143, 79 143, 76 132Z" fill="#8faa50" fillOpacity="0.35" stroke="#6B8E23" strokeWidth="0.7" opacity="0.6"/>
      {/* Corner rosette */}
      <circle cx="10" cy="10" r="5" stroke="#6a5c51" strokeWidth="1.2" fill="none" opacity="0.5"/>
      <circle cx="10" cy="10" r="2.5" fill="#6a5c51" fillOpacity="0.3"/>
    </svg>
  );
}

/* ─── Bottom-Right: scroll column + rosette ──────────────────────────────── */
function BottomRightOrnament() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", transform: "scale(-1,-1)" }}>
      {/* Corner arc frame */}
      <path d="M4 4 C4 4, 60 10, 100 40 C140 70, 170 120, 180 196" stroke="#6a5c51" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M14 14 C14 14, 60 22, 96 50 C132 78, 158 128, 164 196" stroke="#6a5c51" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3"/>
      {/* Rolled scroll vertical */}
      <rect x="26" y="70" width="22" height="60" rx="4" fill="#f5ede0" fillOpacity="0.75" stroke="#6a5c51" strokeWidth="1.2" opacity="0.8"/>
      <ellipse cx="37" cy="70" rx="11" ry="7" fill="#e8d9c0" fillOpacity="0.9" stroke="#6a5c51" strokeWidth="1" opacity="0.85"/>
      <ellipse cx="37" cy="130" rx="11" ry="7" fill="#e8d9c0" fillOpacity="0.9" stroke="#6a5c51" strokeWidth="1" opacity="0.85"/>
      <line x1="30" y1="86" x2="44" y2="86" stroke="#6a5c51" strokeWidth="0.8" opacity="0.45"/>
      <line x1="30" y1="95" x2="44" y2="95" stroke="#6a5c51" strokeWidth="0.8" opacity="0.4"/>
      <line x1="30" y1="104" x2="44" y2="104" stroke="#6a5c51" strokeWidth="0.8" opacity="0.35"/>
      <line x1="30" y1="113" x2="44" y2="113" stroke="#6a5c51" strokeWidth="0.8" opacity="0.3"/>
      {/* Foliage around scroll */}
      <path d="M50 90 C58 80, 72 82, 70 95" stroke="#7a9a40" strokeWidth="1.2" fill="none" opacity="0.65"/>
      <path d="M52 85 C46 74, 62 70, 64 83 C66 96, 56 98, 52 85Z" fill="#8faa50" fillOpacity="0.4" stroke="#6B8E23" strokeWidth="0.8" opacity="0.7"/>
      <path d="M68 96 C62 85, 78 83, 78 96 C78 109, 70 108, 68 96Z" fill="#8faa50" fillOpacity="0.35" stroke="#6B8E23" strokeWidth="0.7" opacity="0.65"/>
      {/* Corner rosette */}
      <circle cx="10" cy="10" r="5" stroke="#6a5c51" strokeWidth="1.2" fill="none" opacity="0.5"/>
      <circle cx="10" cy="10" r="2.5" fill="#6a5c51" fillOpacity="0.3"/>
    </svg>
  );
}

export default function OrnamentalCorners({ opacity = 1, size = "md" }: OrnamentalCornersProps) {
  const px = SIZES[size];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        opacity,
        zIndex: 1,
      }}
      aria-hidden="true"
    >
      {/* Top Left */}
      <div style={{ position: "absolute", top: 0, left: 0, width: px, height: px }}>
        <TopLeftOrnament />
      </div>
      {/* Top Right */}
      <div style={{ position: "absolute", top: 0, right: 0, width: px, height: px }}>
        <TopRightOrnament />
      </div>
      {/* Bottom Left */}
      <div style={{ position: "absolute", bottom: 0, left: 0, width: px, height: px }}>
        <BottomLeftOrnament />
      </div>
      {/* Bottom Right */}
      <div style={{ position: "absolute", bottom: 0, right: 0, width: px, height: px }}>
        <BottomRightOrnament />
      </div>
    </div>
  );
}
