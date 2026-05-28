// Tailwind v4 — no JS config needed for theme customization.
// Theme is defined in globals.css via @theme block.
// This file kept for tooling compatibility only.
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
