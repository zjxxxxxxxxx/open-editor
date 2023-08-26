import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import svg from 'rollup-plugin-svg';
import { liveServer } from 'rollup-plugin-live-server';
import openEditor from '@open-editor/rollup';

const NODE_ENV = process.env.NODE_ENV || 'development';
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json'];

export default {
  input: 'src/index.tsx',
  output: {
    dir: 'dist',
    entryFileNames: '[name].js',
    format: 'esm',
  },
  plugins: [
    commonjs(),
    resolve({
      extensions,
    }),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
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
            development: NODE_ENV === 'development',
          },
        ],
        '@babel/preset-typescript',
      ],
    }),
    postcss(),
    svg({
      base64: true,
    }),
    openEditor({
      displayToggle: true,
    }),
    liveServer({
      port: 3000,
      open: true,
      wait: 1000,
    }),
  ],
};
