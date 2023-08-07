import { definePreset } from 'unbuild';

const __DEV__ = process.env.__DEV__ === 'true';

export default definePreset({
  entries: ['src/index'],
  stub: __DEV__,
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    esbuild: {
      target: 'es6',
      minify: !__DEV__,
    },
  },
  failOnWarn: false,
});
