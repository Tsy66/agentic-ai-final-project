import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/agentic-ai-final-project/', 
});