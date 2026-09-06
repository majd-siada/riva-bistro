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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // Report-only CSP: observe without breaking Next.js inline/runtime scripts.
          {
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "img-src 'self' data: blob: https://api.rivabistro.se https://maps.gstatic.com https://maps.googleapis.com",
              "style-src 'self' 'unsafe-inline'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "connect-src 'self' https://api.rivabistro.se",
              "font-src 'self' data:",
              "frame-src https://www.google.com https://maps.google.com",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
