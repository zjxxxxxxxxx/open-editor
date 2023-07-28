import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import openEditor from '@open-editor/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    openEditor({
      enablePointer: true,
    }),
  ],
});
