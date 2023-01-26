import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  define: {
    "process.env": {},
  },
  build: {
    lib: {
      entry: "./src/webcomp.js",
      name: "humidity-map-component",
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
    },
    minify: false,
  },
});
