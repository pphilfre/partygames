import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { networkInterfaces } from "node:os";
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "phone-network-address",
      configureServer(server) {
        server.middlewares.use("/api/network", (req, res) => {
          const addresses = Object.entries(networkInterfaces())
            .sort(
              ([a], [b]) =>
                Number(/wi-?fi|wlan/i.test(b)) - Number(/wi-?fi|wlan/i.test(a)),
            )
            .flatMap(([, values]) => values || [])
            .filter(
              (a) =>
                a.family === "IPv4" &&
                !a.internal &&
                !a.address.startsWith("169.254."),
            )
            .map(
              (a) =>
                `http://${a.address}:${server.httpServer?.address() && typeof server.httpServer.address() === "object" ? (server.httpServer.address() as { port: number }).port : server.config.server.port || 5173}`,
            );
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ addresses }));
        });
      },
    },
  ],
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
