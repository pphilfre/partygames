import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ["motion/react"],
          react: ["react", "react-dom", "react-router-dom"],
          ui: ["@radix-ui/react-dialog"],
        },
      },
    },
  },
});
