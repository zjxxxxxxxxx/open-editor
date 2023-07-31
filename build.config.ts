import { defineBuildConfig } from 'unbuild';

const __DEV__ = process.env.__DEV__ === 'true';

export default defineBuildConfig({
  stub: __DEV__,
  rollup: {
    esbuild: {
      minify: !__DEV__,
    },
  },
});
