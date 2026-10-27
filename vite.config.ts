import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps asset paths relative so the build works on GitHub Pages
// (served from /st-app/) and when opened from any static host.
export default defineConfig({
  base: './',
  plugins: [react()],
});
