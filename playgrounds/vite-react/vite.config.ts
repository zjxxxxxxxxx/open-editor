import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import OpenEditor from '@open-editor/vite';
import ReactSource from '@open-editor/react-source/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    OpenEditor({
      once: true,
      crossIframe: true,
    }),
    ReactSource(),
  ],
  server: {
    host: '0.0.0.0',
    port: 4003,
  },
});
