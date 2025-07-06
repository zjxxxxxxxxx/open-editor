const OpenEditorWebpackPlugin = require('@open-editor/webpack');
module.exports = {
  webpack: {
    configure: (config) => {
      config.plugins = config.plugins.filter((plugin) => plugin.key !== 'ESLintWebpackPlugin');
      config.plugins.push(require('@open-editor/react/webpack')());
      config.plugins.push(new OpenEditorWebpackPlugin());
      return config;
    },
  },
  devServer: {
    port: 4006,
    open: false,
  },
};
