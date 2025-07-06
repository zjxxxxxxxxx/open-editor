import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import openEditorReact from '@open-editor/react/vite';
import openEditor from '@open-editor/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [openEditorReact(), react(), openEditor()],
  server: {
    host: '0.0.0.0',
    port: 4003,
  },
});
