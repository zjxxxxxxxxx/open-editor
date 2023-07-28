import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import openEditor from '@open-editor/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    openEditor({
      enablePointer: true,
    }),
  ],
});
