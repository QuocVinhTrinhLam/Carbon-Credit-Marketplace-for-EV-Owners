// vite.config.js
import path from "path";
import { defineConfig } from "file:///Users/quocvinhtrinhlam/Desktop/CCMfEO/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///Users/quocvinhtrinhlam/Desktop/CCMfEO/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import tsconfigPaths from "file:///Users/quocvinhtrinhlam/Desktop/CCMfEO/frontend/node_modules/vite-tsconfig-paths/dist/index.js";
var __vite_injected_original_dirname = "/Users/quocvinhtrinhlam/Desktop/CCMfEO/frontend";
var vite_config_default = defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
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
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvcXVvY3Zpbmh0cmluaGxhbS9EZXNrdG9wL0NDTWZFTy9mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3F1b2N2aW5odHJpbmhsYW0vRGVza3RvcC9DQ01mRU8vZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3F1b2N2aW5odHJpbmhsYW0vRGVza3RvcC9DQ01mRU8vZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gXCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI7XG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAgIHBsdWdpbnM6IFtyZWFjdCgpLCB0c2NvbmZpZ1BhdGhzKCldLFxuICAgIHJlc29sdmU6IHtcbiAgICAgICAgYWxpYXM6IHtcbiAgICAgICAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgICBwb3J0OiA1MTczLFxuICAgICAgICBwcm94eToge1xuICAgICAgICAgICAgXCIvYXBpXCI6IHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IFwiaHR0cDovL2xvY2FsaG9zdDo4MDgzXCIsXG4gICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNlY3VyZTogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgd2F0Y2g6IHtcbiAgICAgICAgICAgIGlnbm9yZWQ6IFtcIioqL3RhcmdldC8qKlwiLCBcIioqL3NyYy9tYWluL3Jlc291cmNlcy9zdGF0aWMvKipcIl1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgICAgc291cmNlbWFwOiB0cnVlLFxuICAgICAgICBvdXREaXI6IFwiZGlzdFwiXG4gICAgfVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStULE9BQU8sVUFBVTtBQUNoVixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxtQkFBbUI7QUFIMUIsSUFBTSxtQ0FBbUM7QUFJekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsU0FBUyxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUM7QUFBQSxFQUNsQyxTQUFTO0FBQUEsSUFDTCxPQUFPO0FBQUEsTUFDSCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDeEM7QUFBQSxFQUNKO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDSCxRQUFRO0FBQUEsUUFDSixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUEsTUFDWjtBQUFBLElBQ0o7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNILFNBQVMsQ0FBQyxnQkFBZ0IsaUNBQWlDO0FBQUEsSUFDL0Q7QUFBQSxFQUNKO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDSCxXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsRUFDWjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
