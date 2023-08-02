import { basename, resolve } from 'path';
import { OutputOptions, RollupOptions } from 'rollup';
import esbuildPlugin from 'rollup-plugin-esbuild';
import dtsPlugin from 'rollup-plugin-dts';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { readjson } from './scripts/utils';

const __DEV__ = process.env.__DEV__ === 'true';
const __PACKAGE_ROOT__ = process.env.__PACKAGE_ROOT__ as string;

const entryFile = resolve(__PACKAGE_ROOT__, 'src/index.ts');
const tsconfigFile = resolve(__PACKAGE_ROOT__, 'tsconfig.json');
const packageJson = readjson(resolve(__PACKAGE_ROOT__, 'package.json'));

export default [buildBundles(), buildDTS()];

function buildBundles(): RollupOptions {
  const input = [entryFile];

  const bundles: OutputOptions[] = [
    {
      file: resolve(__PACKAGE_ROOT__, packageJson.module),
      format: 'es',
      sourcemap: true,
    },
    {
      file: resolve(__PACKAGE_ROOT__, packageJson.main),
      format: 'cjs',
      sourcemap: true,
    },
  ];

  return {
    input,
    output: bundles,
    external(source) {
      if (source.startsWith('@')) {
        return true;
      }
      //     module           === module
      //     module           !== /src/module
      return basename(source) === source;
    },
    plugins: [
      esbuildPlugin({
        tsconfig: tsconfigFile,
        target: 'es2020',
        minify: !__DEV__,
      }),
      nodeResolve(),
      commonjs(),
    ],
  };
}

function buildDTS(): RollupOptions {
  return {
    input: entryFile,
    output: {
      file: resolve(__PACKAGE_ROOT__, packageJson.types),
      format: 'es',
      sourcemap: false,
    },
    plugins: [
      dtsPlugin({
        tsconfig: tsconfigFile,
      }),
    ],
  };
}
