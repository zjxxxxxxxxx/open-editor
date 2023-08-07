import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  preset: '../../build.preset',
  externals: ['webpack'],
  rollup: {
    esbuild: {
      target: 'es2020',
    },
  },
});
