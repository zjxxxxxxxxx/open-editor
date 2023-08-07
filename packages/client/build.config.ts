import { copyFileSync } from 'node:fs';
import { defineBuildConfig } from 'unbuild';
import consola from 'consola';
import chalk from 'chalk';

export default defineBuildConfig({
  preset: '../../build.preset',
  hooks: {
    'build:done': () => {
      copyFileSync('./src/runtime.ts', './dist/runtime.js');
      console.log('');
      consola.success(chalk.green('Copy src/runtime.ts -> dist/runtime.js'));
    },
  },
});
