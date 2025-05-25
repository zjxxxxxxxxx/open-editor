/* eslint-disable @typescript-eslint/no-var-requires */
const OpenEditorWebpackPlugin = require('@open-editor/webpack');
const ReactSourceWebpackPlugin = require('@open-editor/react-source/webpack');
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.plugins.push(
      new OpenEditorWebpackPlugin({
        once: true,
        crossIframe: true,
      }),
    );
    config.plugins.push(ReactSourceWebpackPlugin());
    return config;
  },
};

module.exports = nextConfig;
