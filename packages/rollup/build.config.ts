import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  preset: '../../build.preset',
  externals: ['rollup'],
  rollup: {
    esbuild: {
      target: 'es2020',
    },
  },
});
