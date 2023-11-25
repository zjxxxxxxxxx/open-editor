/* eslint-disable @typescript-eslint/no-var-requires */
const { defineConfig } = require('@vue/cli-service');
const OpenEditorWebpackPlugin = require('@open-editor/webpack');
module.exports = defineConfig({
  configureWebpack: {
    plugins: [
      require('unplugin-vue-source/webpack')(),
      new OpenEditorWebpackPlugin(),
    ],
  },
});
