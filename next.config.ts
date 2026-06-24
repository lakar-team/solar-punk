import type { NextConfig } from "next";

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
