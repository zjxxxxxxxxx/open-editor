const OpenEditorWebpackPlugin = require('@open-editor/webpack');
module.exports = {
  webpack: {
    configure: (config) => {
      config.plugins.push(new OpenEditorWebpackPlugin());
      return config;
    },
  },
  devServer: {
    port: 3001,
  },
};
