import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { analyzer } from 'vite-bundle-analyzer';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      config: {
        // You can put your full tailwind config here
        content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
        theme: {
          extend: {},
        },
        // This is the key part to fix the color issue
        future: {
          hoverOnlyWhenSupported: true,
        },
        plugins: [],
      },
    }),
    analyzer(),
  ],
  server: {
    port: 3000, // Unique port for the first app
    host: 'localhost', // Or '127.0.0.1'
  },
});
