import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'three', 'three128'],
  },
  server: {
    watch: {
      // These are canonical ThreeUI reference sources, not application modules.
      // Watching the large HTML files caused costly reload cascades and, on
      // synced macOS folders, intermittent ETIMEDOUT reads.
      ignored: [
        '**/src/shaders/3d-paper/sources/**',
        '**/src/shaders/3d-paper/runtime-chunks/**',
        '**/public/threeui/**',
      ],
    },
  },
});
