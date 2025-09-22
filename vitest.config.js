import { defineConfig, defaultExclude } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@/components/PagerDots": path.resolve(__dirname, "/components/PagerDots.tsx"),
      "@/components": path.resolve(__dirname, "components"),
      "@/data": path.resolve(__dirname, "data"),
      "@/utils/teaTransforms": path.resolve(__dirname, "src/utils/teaTransforms"),
      "@/utils/brewMethods": path.resolve(__dirname, "src/utils/brewMethods"),
      "@/utils/serveModes": path.resolve(__dirname, "src/utils/serveModes"),
      "@/utils": path.resolve(__dirname, "utils"),
      "@": path.resolve(__dirname, "src"),
      "@/styles": path.resolve(__dirname, "styles"),
    },
  },
  test: {
    exclude: [...defaultExclude, "tests/e2e/**"],
  },
});