/* eslint-disable @typescript-eslint/no-var-requires */
const { defineConfig } = require('@vue/cli-service');
const OpenEditorWebpackPlugin = require('@open-editor/webpack');
module.exports = defineConfig({
  configureWebpack: {
    plugins: [
      require('@open-editor/vue-source/webpack')(),
      new OpenEditorWebpackPlugin({
        once: true,
        crossIframe: true,
      }),
    ],
  },
  devServer: {
    port: 4007,
  },
});
