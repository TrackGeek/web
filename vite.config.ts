import { viteImage } from "@son426/vite-image/plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    devtools(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    viteImage(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          const [, pkgPath = ""] = id.split(/node_modules[\\/]/);
          const [scopeOrName, maybeName] = pkgPath.split(/[\\/]/);
          if (!scopeOrName) return;
          return scopeOrName.startsWith("@") && maybeName ? `${scopeOrName}/${maybeName}` : scopeOrName;
        },
      },
    },
  },
});
