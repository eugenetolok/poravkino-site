// vite.config.ts
import { resolve } from "path";

import { defineConfig, Plugin } from "vite"; // Import Plugin type
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

/**
 * Custom Vite plugin to handle MPA fallbacks for the dev server.
 * When a request comes in for a path under `/adminGUI/`, this plugin
 * rewrites it to point to `/adminGUI/index.html`, allowing React Router
 * to take over. It ignores requests for static assets (e.g., .js, .css).
 */
function mpaFallback(): Plugin {
  return {
    name: "mpa-fallback",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith("/adminGUI") && !req.url.includes(".")) {
          req.url = "/adminGUI/index.html";
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  // Add the custom plugin to the plugins array
  plugins: [react(), tsconfigPaths(), tailwindcss(), mpaFallback()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        adminGUI: resolve(__dirname, "adminGUI/index.html"),
      },
    },
  },
  // The incorrect `server` block has been removed and replaced by the plugin.
});
