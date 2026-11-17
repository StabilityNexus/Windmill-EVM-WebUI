import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // ── Turbopack Workspace Root Override ─────────────────────────────
  turbopack: {
    root: path.resolve(__dirname),
  },

  // ── Production Output ────────────────────────────────────────────
  // 'export' writes a static site to out/ for GitHub Pages
  output: "export",
  images: {
    unoptimized: true,
  },

  // ── Performance ──────────────────────────────────────────────────
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
