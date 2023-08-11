import openEditor from '@open-editor/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxthq/ui'],
  vite: {
    plugins: [
      openEditor({
        enablePointer: true,
      }),
    ],
  },
});
