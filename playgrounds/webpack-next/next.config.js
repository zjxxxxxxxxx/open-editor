const OpenEditorWebpackPlugin = require('@open-editor/webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.plugins.push(
      new OpenEditorWebpackPlugin({
        enablePointer: true,
      }),
    );
    return config;
  },
};

module.exports = nextConfig;
