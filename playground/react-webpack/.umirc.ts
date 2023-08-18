import { defineConfig } from 'umi';
import OpenEditorWebpackPlugin from '@open-editor/webpack';

export default defineConfig({
  routes: [
    { path: '/', component: 'index' },
    { path: '/docs', component: 'docs' },
  ],
  npmClient: 'pnpm',
  chainWebpack(config) {
    config.module
      .rule('mjs-rule')
      .test(/.m?js/)
      .resolve.set('fullySpecified', false);
    config.plugin('*').use(OpenEditorWebpackPlugin, [
      {
        displayToggle: true,
      },
    ]);
  },
});
