import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import process from "node:process";

export default defineConfig(({ mode }) => {
  // Load env file based on the current mode (development / production)
  const env = loadEnv(mode, process.cwd(), "");
  const BASE_URL = env.VITE_BASE_URL;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "credentialless",
      },
      cors: {
        origin: [
          "http://localhost:5173",
          "http://localhost:8000",
          "http://localhost:3000",
          "https://res.cloudinary.com",
          BASE_URL,
        ],
        credentials: true,
      },
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
