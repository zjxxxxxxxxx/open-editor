import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueSource from 'unplugin-vue-source/vite';
import openEditor from '@open-editor/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [VueSource({}), vue(), openEditor()],
  server: {
    host: '0.0.0.0',
  },
});
