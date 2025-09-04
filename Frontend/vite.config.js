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
          "http://localhost:5173", // frontend dev
          "http://localhost:8000", // backend dev
          "http://localhost:3000", // alternative dev
          BASE_URL, // your hosted backend URL from .env
          "https://res.cloudinary.com",
        ],
        credentials: true,
      },
      // only proxy in development
      proxy:
        mode === "development"
          ? {
              "/api": {
                target: BASE_URL,
                changeOrigin: true,
                secure: false,
              },
            }
          : undefined,
    },
    // for production deployment
    build: {
      outDir: "dist",
    },
  };
});
