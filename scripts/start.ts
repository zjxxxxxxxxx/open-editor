import { resolve } from 'node:path';
import { readdirSync } from 'node:fs';
import consola from 'consola';
import enquirer from 'enquirer';
import minimist from 'minimist';

import { exec, readjson } from './utils';

main();

async function main() {
  try {
    const { playground = await selectPlayground(), script = await selectScript(playground) } =
      minimist(process.argv.slice(1));

    consola.info(`Run ${playground}:${script}`);
    exec(`pnpm --filter @playground/${playground} ${script}`);
  } catch {
    consola.error('exit');
    process.exit();
  }
}

async function selectPlayground() {
  const playgrounds = readdirSync(resolve('playgrounds'));
  const { playground } = await enquirer.prompt<{
    playground: string;
  }>({
    type: 'select',
    name: 'playground',
    message: 'Please select playground',
    choices: playgrounds,
  });
  return playground;
}

async function selectScript(playground: string) {
  const { scripts } = readjson(resolve('playgrounds', playground, 'package.json'));
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
  return script;
}
