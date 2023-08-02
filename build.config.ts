import { defineBuildConfig } from 'unbuild';

const __DEV__ = process.env.__DEV__ === 'true';

export default defineBuildConfig({
  entries: [{ input: 'src/index' }],
  stub: __DEV__,
  declaration: true,
  rollup: {
    emitCJS: true,
    esbuild: {
      minify: !__DEV__,
    },
  },
  failOnWarn: false,
});
