import { NextResponse } from "next/server";

/**
 * Apply security headers on every HTML/document response.
 * Complements next.config.ts headers() — Hostinger Node must rebuild from a
 * commit that includes this file for live headers to appear.
 */
export function middleware() {
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  // Report-only CSP — do not enforce without a product decision.
  response.headers.set(
    "Content-Security-Policy-Report-Only",
    [
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
  );
  return response;
}

export const config = {
  matcher: [
    /*
     * Skip static assets and Next internals; apply to pages/API routes.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
