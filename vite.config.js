import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "src/"),
      "@layouts": path.resolve(__dirname, "src/layouts/"),
      "@pages": path.resolve(__dirname, "src/pages/"),
      "@components": path.resolve(__dirname, "src/components/"),
      "@assets": path.resolve(__dirname, "src/assets/"),
      "@utils": path.resolve(__dirname, "src/utils/"),
      "@hooks": path.resolve(__dirname, "src/hooks/"),
    },
  },
});
