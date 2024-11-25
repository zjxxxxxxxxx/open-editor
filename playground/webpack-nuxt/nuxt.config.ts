import OpenEditorWebpackPlugin from '@open-editor/webpack';
import VueSource from 'unplugin-vue-source/webpack';

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
  builder: 'webpack',
  webpack: {
    plugins: [new OpenEditorWebpackPlugin(), VueSource()],
  },
  devServer: {
    port: 4006,
  },
});
