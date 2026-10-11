import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('@radix-ui')) return 'radix';
          if (id.includes('@tanstack')) return 'query';
          if (id.includes('react-router-dom')) return 'router';
          if (
            id.includes('react-dom') ||
            id.includes('react/jsx-runtime') ||
            /\/react(\/|$)/.test(id) ||
            id.includes('scheduler') ||
            id.includes('loose-envify') ||
            id.includes('use-sync-external-store')
          )
            return 'react';
          if (id.includes('lucide-react')) return 'icons';
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
