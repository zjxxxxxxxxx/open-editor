const { OpenEditorWebpackPlugin } = require('@open-editor/webpack');

module.exports = {
  configureWebpack: {
    plugins: [
      new OpenEditorWebpackPlugin({
        enablePointer: true,
      }),
    ],
  },
};
