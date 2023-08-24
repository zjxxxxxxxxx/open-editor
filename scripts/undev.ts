import { basename, resolve } from 'node:path';
import { OutputOptions, RollupOptions } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import esbuildPlugin from 'rollup-plugin-esbuild';
import dtsPlugin from 'rollup-plugin-dts';

import { readjson } from './utils';

export type BuildOutput =
  | string
  | {
      require?: string;
      import?: string;
      types?: string;
    };

export default function buildConfigs() {
  const exports = readjson(resolve('./package.json')).exports;
  const outputs = <[string, BuildOutput][]>(
    Object.entries(exports).map(([input, output]) => [
      normalizeInput(input),
      output,
    ])
  );

  return outputs.flatMap(([input, output]) => buildConfig(input, output));
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
      sourcemap: true,
    });
  } else {
    if (output.require) {
      bundles.push({
        file: output.require,
        format: 'cjs',
        sourcemap: true,
      });
    }

    if (output.import) {
      bundles.push({
        file: output.import,
        format: 'esm',
        sourcemap: true,
      });
    }
  }

  if (!bundles.length) return;

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
        target: ['vite', 'rollup', 'webpack'].includes(basename(resolve()))
          ? 'es2020'
          : 'es6',
      }),
      nodeResolve(),
      commonjs(),
    ],
  };
}

function buildDTS(input: string, output: BuildOutput): RollupOptions | void {
  if (typeof output === 'string' || !output.types) return;

  return {
    input,
    output: {
      file: output.types,
      format: 'esm',
      sourcemap: false,
    },
    plugins: [dtsPlugin()],
  };
}

function normalizeInput(input: string) {
  const filename = input.replace(/^\.\/?/, '') || 'index';
  return `./src/${filename}.ts`;
}
