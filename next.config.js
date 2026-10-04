/**
 * Hash of THEME_INIT_SCRIPT in src/lib/themeMode.ts, the only inline script
 * the site runs. src/lib/themeMode.test.ts fails if the two drift apart.
 */
const THEME_SCRIPT_HASH = "sha256-a8c+ZfR7K/dDf3mbL/qHJaZ3NICKEd1Nua60d9EhhJY=";

/**
 * Same-origin everything. Styles allow inline because the theme tokens are a
 * server-rendered <style> block and components set runtime style values.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' '${THEME_SCRIPT_HASH}'`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // Safe because the CSP already allows images and fonts from this origin only.
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
  // Browsers ignore this over plain HTTP, so staging is unaffected.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Lean production image: emits .next/standalone with a self-contained server.js.
  output: "standalone",
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

module.exports = nextConfig;
