import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import OpenEditor from '@open-editor/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        retainLines: true,
      },
    }),
    OpenEditor(),
  ],
  server: {
    host: '0.0.0.0',
  },
});
