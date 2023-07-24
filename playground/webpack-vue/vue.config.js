const { OpenEditorPlugin } = require('@open-editor/webpack');

module.exports = {
  configureWebpack: {
    plugins: [
      new OpenEditorPlugin({
        enablePointer: true,
      }),
    ],
  },
};
