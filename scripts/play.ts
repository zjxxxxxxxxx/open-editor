import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import enquirer from 'enquirer';
import consola from 'consola';
import { exec } from './utils';

main();

async function main() {
  try {
    const playgrounds = readdirSync(resolve('playground')).filter(
      (i) => i !== '.DS_Store',
    );
    const { playground } = await enquirer.prompt<{
      playground: string;
    }>({
      type: 'select',
      name: 'playground',
      message: 'Please select playground',
      choices: playgrounds,
    });

    const { scripts } = await import(
      resolve('playground', playground, 'package.json')
    );
    const { script } = await enquirer.prompt<{
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
    });

    consola.info(`Run ${playground}:${script}`);
    exec(`pnpm --filter @playground/${playground} ${script}`);
  } catch {
    consola.error('exit');
    process.exit();
  }
}
