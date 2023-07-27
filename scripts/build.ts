import { readFileSync } from 'fs';
import { basename, resolve } from 'path';
import { gzipSync } from 'zlib';
import fg from 'fast-glob';
import minimist from 'minimist';
import consola from 'consola';
import chalk from 'chalk';
import { __dirname, exec, safeExit } from './utils';

const args = minimist(process.argv.slice(2));
const __DEV__ = Boolean(args.dev || args.d);
const __PACKAGE_ROOT__ = resolve();

const watch = Boolean(args.watch || args.w);

safeExit(main);

function main() {
  const env = [
    `__DEV__:${__DEV__}`,
    `__PACKAGE_ROOT__:${__PACKAGE_ROOT__}`,
  ].join(',');

  const rollup = [
    'pnpm rollup -c rollup.config.ts --configPlugin typescript',
    watch ? '-w' : '',
    `--environment=${env}`,
  ].join(' ');

  const command = [`cd ${__dirname}`, rollup].join(' && ');

  exec(command);

  if (!__DEV__) {
    logSizes(resolve(__PACKAGE_ROOT__, 'dist/**.js'));
  }
}

function logSizes(source: string) {
  for (const filePath of fg.sync(source)) {
    const file = readFileSync(filePath);
    const minSize = (file.length / 1024).toFixed(2) + 'kb';
    const gzipped = gzipSync(file);
    const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb';

    consola.log(
      `${chalk.gray(
        chalk.bold(basename(filePath)),
      )} min:${minSize} / gzip:${gzippedSize}`,
    );
  }
}
