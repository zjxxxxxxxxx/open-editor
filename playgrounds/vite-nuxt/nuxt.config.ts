import openEditorVue from '@open-editor/vue/vite';
import openEditor from '@open-editor/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Open Editor',
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/logo.png',
        },
      ],
    },
  },
  css: ['~/assets/app.css'],
  vite: {
    plugins: [openEditorVue(), openEditor()],
  },
  devtools: {
    enabled: false,
  },
  devServer: {
    port: 4002,
  },
});
