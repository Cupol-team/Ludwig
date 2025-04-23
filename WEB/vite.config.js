import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: ["cupol.xyz"],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      "@api": path.resolve(__dirname, "src/api"),
    },
  },
});
