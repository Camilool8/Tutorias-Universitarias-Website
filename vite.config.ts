import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ViteMinifyPlugin } from "vite-plugin-minify";

export default defineConfig({
  plugins: [react(), ViteMinifyPlugin({})],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
