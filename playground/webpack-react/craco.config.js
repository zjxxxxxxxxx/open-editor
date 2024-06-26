// eslint-disable-next-line @typescript-eslint/no-var-requires
const OpenEditorWebpackPlugin = require('@open-editor/webpack');
module.exports = {
  webpack: {
    configure: (config) => {
      config.plugins.push(new OpenEditorWebpackPlugin());
      return config;
    },
  },
  devServer: {
    port: 3000,
    open: false,
  },
};
