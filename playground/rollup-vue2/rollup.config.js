import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import image from '@rollup/plugin-image';
import postcss from 'rollup-plugin-postcss';
import VueSource from 'unplugin-vue-source/rollup';
import vue from 'rollup-plugin-vue';
import openEditor from '@open-editor/rollup';
import { liveServer } from 'rollup-plugin-live-server';

const extensions = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
  '.vue',
  '.json',
];

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/main.js',
    format: 'esm',
  },
  plugins: [
    VueSource({}),
    vue({
      exposeFilename: true,
    }),
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
      presets: ['@babel/preset-env', '@babel/preset-typescript'],
    }),
    postcss(),
    image(),
    openEditor({
      displayToggle: true,
    }),
    liveServer({
      port: 3000,
      wait: 1000,
    }),
  ],
};
