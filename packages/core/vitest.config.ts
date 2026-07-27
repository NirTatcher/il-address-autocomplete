import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataRoot = path.resolve(__dirname, "../data");

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@il-address/data/cities.json": path.join(dataRoot, "generated/cities.json"),
      "@il-address/data/manifest.json": path.join(dataRoot, "manifest.json"),
      "@il-address/data/loader": path.join(dataRoot, "generated/street-loader.js"),
    },
  },
});
