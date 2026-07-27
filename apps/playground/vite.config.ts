import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataRoot = path.resolve(__dirname, "../../packages/data");
const coreSrc = path.resolve(__dirname, "../../packages/core/src/index.ts");
const reactSrc = path.resolve(__dirname, "../../packages/react/src/index.ts");

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    fs: {
      allow: [path.resolve(__dirname, "../..")],
    },
  },
  resolve: {
    alias: [
      {
        find: "@il-address/data/cities.json",
        replacement: path.join(dataRoot, "generated/cities.json"),
      },
      {
        find: "@il-address/data/manifest.json",
        replacement: path.join(dataRoot, "manifest.json"),
      },
      {
        find: "@il-address/data/loader",
        replacement: path.join(dataRoot, "generated/street-loader.js"),
      },
      {
        find: /^@il-address\/data\/streets\/(.+)$/,
        replacement: path.join(dataRoot, "generated/streets/$1"),
      },
      {
        find: "@il-address/core",
        replacement: coreSrc,
      },
      {
        find: "@il-address/react",
        replacement: reactSrc,
      },
    ],
  },
  optimizeDeps: {
    exclude: ["@il-address/core", "@il-address/react", "@il-address/data"],
  },
});
