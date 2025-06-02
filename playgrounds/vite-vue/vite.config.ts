import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueSource from '@open-editor/vue-source/vite';
import OpenEditor from '@open-editor/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueSource(),
    OpenEditor({
      once: true,
      crossIframe: true,
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 4004,
  },
});
