import OpenEditor from '@open-editor/vite';
import VueSource from 'unplugin-vue-source/vite';

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
  css: ['~/assets/style.css'],
  vite: {
    plugins: [OpenEditor(), VueSource({})],
  },
  devtools: {
    enabled: true,
  },
});
