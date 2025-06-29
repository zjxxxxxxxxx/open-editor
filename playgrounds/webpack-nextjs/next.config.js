const OpenEditorWebpackPlugin = require('@open-editor/webpack');
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { isServer }) {
    if (!isServer) {
      config.plugins.push(require('@open-editor/react/webpack')());
    }
    config.plugins.push(new OpenEditorWebpackPlugin());
    return config;
  },
};

module.exports = nextConfig;
