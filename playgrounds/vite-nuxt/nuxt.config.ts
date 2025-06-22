import vueSource from '@open-editor/vue-source/vite';
import OpenEditor from '@open-editor/vite';

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
      vueSource(),
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
