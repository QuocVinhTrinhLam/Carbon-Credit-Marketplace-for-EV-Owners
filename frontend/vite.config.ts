import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8083",
        changeOrigin: true,
        secure: false
      }
    },
    watch: {
      ignored: ["**/target/**", "**/src/main/resources/static/**"]
    }
  },
  build: {
    sourcemap: true,
    outDir: "dist"
  }
});
