import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for deploying Jewelora to GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/Jewelora/',
});
