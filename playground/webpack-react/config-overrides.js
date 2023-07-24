const { OpenEditorPlugin } = require('@open-editor/webpack');

module.exports = function override(config, env) {
  if (env === 'development') {
    config.plugins.push(
      new OpenEditorPlugin({
        enablePointer: true,
      }),
    );
  }
  return config;
};
