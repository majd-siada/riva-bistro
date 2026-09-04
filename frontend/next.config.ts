import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  // Monorepo: production deps (e.g. next) are hoisted to the repository root.
  outputFileTracingRoot: path.join(__dirname, ".."),
  transpilePackages: ["@riva-bistro/api-client"],
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000" },
      { protocol: "http", hostname: "backend", port: "8000" },
      { protocol: "https", hostname: "api.rivabistro.se" },
      { protocol: "https", hostname: "rivabistro.se" },
      { protocol: "https", hostname: "www.rivabistro.se" },
    ],
  },
};

export default nextConfig;
