import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ViteMinifyPlugin } from "vite-plugin-minify";
import { compression } from "vite-plugin-compression2";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  plugins: [
    react(),
    ViteMinifyPlugin({}),
    compression({
      algorithm: "gzip",
      filename: "[path][base].gz",
    }),
    compression({
      algorithm: "brotliCompress",
      filename: "[path][base].br",
    }),
    ViteImageOptimizer({
      jpg: {
        quality: 80,
      },
      png: {
        quality: 80,
      },
      webp: {
        lossless: true,
      },
    }),
  ],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
