import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:4000" } },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) return "react-vendor";
          if (id.includes("node_modules/framer-motion")) return "motion";
          if (id.includes("node_modules/lucide-react")) return "icons";
        },
      },
    },
  },
});
