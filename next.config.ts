import type { NextConfig } from "next";

// Content-Security-Policy. 'unsafe-inline' is required for Next's hydration
// bootstrap scripts and styled-jsx / inline styles; tighten to a nonce-based
// policy later. Everything else is locked to same-origin (+ data: for inline
// SVG/font data URIs). No external origins are used (fonts are self-hosted via
// next/font, images live under /public).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "frame-src https://mc.yandex.ru",
  "img-src 'self' data: https://mc.yandex.ru https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' https://mc.yandex.ru https://www.googletagmanager.com",
  "font-src 'self' data:",
  "connect-src 'self' https://mc.yandex.ru https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
