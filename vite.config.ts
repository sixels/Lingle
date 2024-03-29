import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import ViteSolid from "vite-plugin-solid";

import app from "./package.json";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@styles": path.resolve(__dirname, "./src/../styles"),
    },
  },
  publicDir: "static",
  build: {
    target: "esnext",
    polyfillDynamicImport: false,
  },
  plugins: [
    ViteSolid(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["**/*.png", "**/*.svg", "**/*.woff2", "**/*.css"],
      workbox: {
        // a little hack to get remixicon.woff2 cached
        runtimeCaching: [
          {
            handler: "CacheFirst",
            urlPattern:
              /^(https:\/\/lingle.vercel.app|http:\/\/localhost.*)\/assets\/.*\.woff2/,
            method: "GET",
            options: {
              cacheName: "runtime",
              // set expiration to 7 days since dependabot updates dependencies every week
              expiration: { maxEntries: 25, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
      manifest: {
        name: "Lingle",
        short_name: "Lingle",
        description: "Um jogo de palavras em português inspirado em Wordle.",
        id: `lingle-${app.version}`,
        icons: [
          {
            src: "favicon/android-chrome-192x192.png",
            type: "image/png",
            sizes: "192x192",
          },
          {
            src: "favicon/android-chrome-512x512.png",
            type: "image/png",
            sizes: "512x512",
          },
        ],
        background_color: "#353940",
        theme_color: "#5aba80",
        display: "standalone",
        orientation: "portrait",
        lang: "pt-br",
      },
    }),
  ],
});
