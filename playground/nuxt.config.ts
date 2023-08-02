import openEditor from '@open-editor/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  vite: {
    plugins: [
      openEditor({
        enablePointer: true,
      }),
    ],
  },
});

// import OpenEditorWebpackPlugin from '@open-editor/webpack';

// export default defineNuxtConfig({
//   builder: 'webpack',
//   webpack: {
//     plugins: [
//       new OpenEditorWebpackPlugin({
//         enablePointer: true,
//       }),
//     ],
//   },
// });
