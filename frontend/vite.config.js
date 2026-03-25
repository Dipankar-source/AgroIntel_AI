import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // server: {
  //   host: '0.0.0.0', // You can also try using 'localhost' instead
  //   port: 8000,
  //   strictPort: true,
  //   allowedHosts: [
  //     '5ce3-2409-4088-9bb3-667-5926-76ce-a16d-e8a0.ngrok-free.app', // New ngrok URL
  //     'localhost',
  //     '0.0.0.0'
  //   ],
  //   hmr: {
  //     clientPort: 443, // Ensure this matches the ngrok URL's port
  //   },
  // },
});