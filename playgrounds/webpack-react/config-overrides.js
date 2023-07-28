const OpenEditorWebpackPlugin = require('@open-editor/webpack');

module.exports = function override(config, env) {
  if (env === 'development') {
    config.plugins.push(
      new OpenEditorWebpackPlugin({
        enablePointer: true,
      }),
    );
  }
  return config;
};
