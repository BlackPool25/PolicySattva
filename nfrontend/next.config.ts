import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.e2b.app"],
  // Allow external images if needed for avatars/documents
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // No transpilation needed — using App Router
  experimental: {
    // optimizePackageImports: ["framer-motion", "lucide-react"],
  },
};

export default nextConfig;
