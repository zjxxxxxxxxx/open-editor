const { defineConfig } = require('@vue/cli-service');
const OpenEditorWebpackPlugin = require('@open-editor/webpack');
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new OpenEditorWebpackPlugin({
        displayToggle: true,
      }),
    ],
  },
});
