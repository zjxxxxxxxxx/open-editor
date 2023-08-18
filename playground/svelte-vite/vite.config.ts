import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import openEditor from '@open-editor/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    openEditor({
      displayToggle: true,
    }),
  ],
});
