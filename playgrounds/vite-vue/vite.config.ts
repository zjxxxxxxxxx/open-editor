import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import openEditorVue from '@open-editor/vue/vite';
import openEditor from '@open-editor/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [openEditorVue(), vue(), vueJsx(), openEditor()],
  server: {
    host: '0.0.0.0',
    port: 4004,
  },
});
