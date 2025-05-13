import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "credentialless", // Use "credentialless" instead of "require-corp"
    },
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:8000",
        "http://localhost:3000",
        "https://res.cloudinary.com",
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
});
