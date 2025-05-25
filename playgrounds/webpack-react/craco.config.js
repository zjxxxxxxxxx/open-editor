/* eslint-disable @typescript-eslint/no-var-requires */
const OpenEditorWebpackPlugin = require('@open-editor/webpack');
const ReactSourceWebpackPlugin = require('@open-editor/react-source/webpack');
module.exports = {
  webpack: {
    configure: (config) => {
      config.plugins.push(
        new OpenEditorWebpackPlugin({
          once: true,
          crossIframe: true,
        }),
      );
      config.plugins.push(ReactSourceWebpackPlugin());
      return config;
    },
  },
  devServer: {
    port: 4006,
    open: false,
  },
};
