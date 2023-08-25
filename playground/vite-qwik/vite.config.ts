import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import OpenEditor from '@open-editor/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    qwikVite({
      csr: true,
    }),
    OpenEditor({
      displayToggle: true,
    }),
  ],
});
