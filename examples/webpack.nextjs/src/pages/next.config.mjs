import { OpenEditorPlugin } from '@open-editor/webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.plugins.push(
      new OpenEditorPlugin({
        enablePointer: true,
      }),
    );
    return config;
  },
};

export default nextConfig;
