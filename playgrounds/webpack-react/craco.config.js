// eslint-disable-next-line @typescript-eslint/no-var-requires
const OpenEditorWebpackPlugin = require('@open-editor/webpack');
module.exports = {
  webpack: {
    configure: (config) => {
      config.plugins.push(
        new OpenEditorWebpackPlugin({
          once: true,
          crossIframe: true,
        }),
      );
      return config;
    },
  },
  devServer: {
    port: 4006,
    open: false,
  },
};
