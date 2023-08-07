import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  preset: '../../build.preset',
  externals: ['vite'],
  rollup: {
    esbuild: {
      target: 'es2020',
    },
  },
});
