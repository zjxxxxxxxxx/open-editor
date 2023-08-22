import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { qwikVite } from '@builder.io/qwik/optimizer';
import openEditor from '@open-editor/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: 'apps/react',
      exclude: 'apps/qwik',
    }),
    vue({
      // include: 'apps/vue',
    }),
    svelte({
      // include: 'apps/svelte',
    }),
    qwikVite({
      csr: true,
      srcDir: 'apps/qwik',
    }),
    openEditor({
      displayToggle: true,
    }),
  ],
});
