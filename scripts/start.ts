import { resolve } from 'node:path';
import { readdirSync } from 'node:fs';
import consola from 'consola';
import enquirer from 'enquirer';
import minimist from 'minimist';

import { exec } from './utils';

main();

async function main() {
  try {
    let { playground, script } = minimist(process.argv.slice(1));

    if (!playground) {
      const playgrounds = readdirSync(resolve('playground')).filter(
        (i) => i !== '.DS_Store',
      );
      ({ playground } = await enquirer.prompt<{
        playground: string;
      }>({
        type: 'select',
        name: 'playground',
        message: 'Please select playground',
        choices: playgrounds,
      }));
    }

    if (!script) {
      const { scripts } = await import(
        resolve('playground', playground, 'package.json')
      );
      ({ script } = await enquirer.prompt<{
        script: string;
      }>({
        type: 'select',
        name: 'script',
        message: 'Please select script',
        choices: Object.entries(scripts).map(([name, content]) => ({
          name: name,
          value: name,
          message: `${(name + ':').padEnd(9)}${content}`,
        })),
      }));
    }

    consola.info(`Run ${playground}:${script}`);
    exec(`pnpm --filter @playground/${playground} ${script}`);
  } catch {
    consola.error('exit');
    process.exit();
  }
}
