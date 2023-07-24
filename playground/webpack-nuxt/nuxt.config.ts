import { OpenEditorPlugin } from '@open-editor/webpack';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  builder: 'webpack',
  devtools: { enabled: true },
  webpack: {
    plugins: [
      new OpenEditorPlugin({
        enablePointer: true,
      }),
    ],
  },
});
