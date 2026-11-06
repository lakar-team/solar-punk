import type { NextConfig } from "next";

// consolidated: solar-punk-portfolio renamed to solar-punk 2026-06-27
const nextConfig: NextConfig = {
  // Prevent server-side bundling of Node.js-only native packages
  serverExternalPackages: ["onnxruntime-node", "sharp"],

  // Turbopack (Next.js 16 default) — resolve aliases for browser bundles.
  // Prevents the Node.js ORT backend from being pulled into the client chunk.
  turbopack: {
    resolveAlias: {
      "sharp": "./src/_empty.ts",
      "onnxruntime-node": "./src/_empty.ts",
    },
  },

  // Webpack fallback (used by next dev --webpack or older tooling)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    };
    return config;
  },

  // Short, shareable URLs for the standalone HTML pages in public/
  // (CVs and the portfolio guide are linked directly from emails).
  async rewrites() {
    return [
      { source: "/cv/tech", destination: "/cv/tech.html" },
      { source: "/cv/aec", destination: "/cv/aec.html" },
      { source: "/guide", destination: "/guide.html" },
    ];
  },

  // The printed PDF CV was retired in favour of the HTML CVs; keep old links working.
  async redirects() {
    return [
      { source: "/Adam_Tech_CV.pdf", destination: "/cv/tech", permanent: false },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Enables SharedArrayBuffer — required for threaded WASM (Kokoro TTS)
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // credentialless (not require-corp) so cross-origin iframes in the HUD
          // (Amazon, YouTube, Redbubble links) still load without credentials
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

export default nextConfig;
