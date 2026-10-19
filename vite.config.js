import { defineConfig } from "vite";

export default defineConfig({
  // Relative URLs support GitHub Pages project sites and custom domains.
  base: "./",
  build: {
    rollupOptions: {
      output: {
        // Keep the heavy, rarely-changing libraries in their own chunks so
        // repeat visits only re-download the app itself.
        manualChunks: {
          three: ["three"],
          motion: ["framer-motion"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
});
