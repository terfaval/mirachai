import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@/components/PagerDots": path.resolve(__dirname, "/components/PagerDots.tsx"),
      "@/components": path.resolve(__dirname, "components"),
      "@/utils/teaTransforms": path.resolve(__dirname, "src/utils/teaTransforms"),
      "@/utils": path.resolve(__dirname, "utils"),
      "@": path.resolve(__dirname, "src"),
      "@/styles": path.resolve(__dirname, "styles"),
    },
  },
});