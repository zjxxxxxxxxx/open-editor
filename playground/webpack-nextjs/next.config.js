const OpenEditorWebpackPlugin = require('@open-editor/webpack');
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.plugins.push(new OpenEditorWebpackPlugin());
    return config;
  },
};

module.exports = nextConfig;
