import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const app = require("./package.json");

export default defineConfig({
  publicDir: "static",
  plugins: [
    VitePWA({
      // workbox: { sourcemap: true },
      includeAssets: ["**/*.png", "**/*.svg", "**/*.woff2"],
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
