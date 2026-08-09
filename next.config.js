/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Lean production image: emits .next/standalone with a self-contained server.js.
  output: "standalone",
};

module.exports = nextConfig;
