import { basename, resolve } from 'node:path';
import { OutputOptions, RollupOptions } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';

import postcss from './postcss';
import { clientRoot, readjson } from './utils';

const __DEV__ = '__DEV__' in process.env;
const __TARGET__ = process.env.__TARGET__ || 'es6';

const isClient = clientRoot === resolve();

export type BuildOutput =
  | string
  | {
      require?: string;
      import?: string;
      types?: string;
    };

export default function buildConfigs() {
  const { exports } = readjson(resolve('./package.json'));
  const builds = <[string, BuildOutput][]>(
    Object.entries(exports).map(([input, output]) => [
      normalizeInput(input),
      output,
    ])
  );

  return builds.flatMap(([input, output]) => buildConfig(input, output));
}

function buildConfig(input: string, output: BuildOutput) {
  return [buildBundles(input, output), buildDTS(input, output)].filter(Boolean);
}

function buildBundles(
  input: string,
  output: BuildOutput,
): RollupOptions | void {
  const bundles: OutputOptions[] = [];

  if (typeof output === 'string') {
    bundles.push({
      file: output,
      format: 'esm',
      sourcemap: __DEV__,
    });
  } else {
    if (output.require) {
      bundles.push({
        file: output.require,
        format: 'cjs',
        sourcemap: __DEV__,
      });
    }

    if (output.import) {
      bundles.push({
        file: output.import,
        format: 'esm',
        sourcemap: __DEV__,
      });
    }
  }

  if (bundles.length) {
    return {
      input,
      output: bundles,
      external(source) {
        return source.startsWith('@') || basename(source) === source;
      },
      plugins: [
        isClient ? postcss() : undefined,
        nodeResolve(),
        commonjs(),
        esbuild({
          target: __TARGET__,
          minifySyntax: !__DEV__,
          minifyWhitespace: !__DEV__,
          supported: {
            'class-field': true,
          },
        }),
      ].filter(Boolean),
    };
  }
}

function buildDTS(input: string, output: BuildOutput): RollupOptions | void {
  if (typeof output === 'object' && output.types) {
    return {
      input,
      output: {
        file: output.types,
        format: 'esm',
        sourcemap: false,
      },
      plugins: [dts()],
    };
  }
}

function normalizeInput(input: string) {
  const filename = input.replace(/^\.\/?/, '') || 'index';
  return `./src/${filename}.ts`;
}
