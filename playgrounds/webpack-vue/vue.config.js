const { defineConfig } = require('@vue/cli-service');
const OpenEditorWebpackPlugin = require('@open-editor/webpack');
module.exports = defineConfig({
  configureWebpack: {
    plugins: [require('@open-editor/vue/webpack')(), new OpenEditorWebpackPlugin()],
  },
  devServer: {
    port: 4007,
  },
});
