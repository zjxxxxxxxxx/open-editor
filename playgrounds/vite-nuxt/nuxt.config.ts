import OpenEditor from '@open-editor/vite';
import VueSource from '@open-editor/vue-source/vite';

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
    plugins: [
      VueSource(),
      OpenEditor({
        once: true,
        crossIframe: true,
      }),
    ],
  },
  devtools: {
    enabled: false,
  },
  devServer: {
    port: 4002,
  },
});
