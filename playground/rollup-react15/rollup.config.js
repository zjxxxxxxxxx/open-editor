import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import svg from 'rollup-plugin-svg';
import { liveServer } from 'rollup-plugin-live-server';
import OpenEditor from '@open-editor/rollup';

const extensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json'];

export default {
  input: 'src/index.tsx',
  output: {
    file: 'dist/index.js',
    format: 'esm',
  },
  moduleContext(id) {
    if (id.endsWith('.tsx')) {
      return 'window';
    }
  },
  plugins: [
    commonjs(),
    resolve({
      extensions,
    }),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    babel({
      babelHelpers: 'bundled',
      extensions,
      presets: [
        '@babel/preset-env',
        [
          '@babel/preset-react',
          {
            runtime: 'automatic',
            development: process.env.NODE_ENV === 'development',
          },
        ],
        '@babel/preset-typescript',
      ],
    }),
    postcss(),
    svg({
      base64: true,
    }),
    OpenEditor(),
    liveServer({
      port: 4000,
      wait: 1000,
    }),
  ],
};
