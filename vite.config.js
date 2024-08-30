import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    strictPort: true, // Ensures Vite server uses the specified port
    mimeTypes: {
      'application/javascript': ['js', 'jsx'],
    },
  },
  build: {
    outDir: 'dist', // Output directory
    rollupOptions: {
      input: '/index.html', // Entry file
    },
  },
});
