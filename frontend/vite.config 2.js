import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
var API_PROXY = "http://localhost:4000";
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "next/navigation": path.resolve(__dirname, "./src/mocks/next-navigation.ts"),
        }
    },
    server: {
        port: 5173,
        strictPort: true,
        proxy: {
            "/api": {
                target: API_PROXY,
                changeOrigin: true,
                secure: false,
                rewrite: function (path) { return path.replace(/^\/api/, ""); } // map /api/listings -> /listings
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
