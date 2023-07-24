import { readdirSync } from 'node:fs';
import path from 'node:path';
import enquirer from 'enquirer';
import consola from 'consola';
import { exec, readjson, safeExit } from './utils';

safeExit(main);

async function main() {
  const playgroundRoot = 'playground';

  const playgroundPath = path.resolve(playgroundRoot);
  const playgroundItems = readdirSync(playgroundPath);
  const { playground } = await enquirer.prompt<{
    playground: string;
  }>({
    type: 'select',
    name: 'playground',
    message: 'Please select the playground',
    choices: playgroundItems,
  });

  const packagePath = path.resolve(playgroundRoot, playground, 'package.json');
  const { scripts } = readjson(packagePath);
  const { script } = await enquirer.prompt<{
    script: string;
  }>({
    type: 'select',
    name: 'script',
    message: 'Please select script',
    choices: Object.entries(scripts).map(([name, content]) => ({
      name: name,
      value: name,
      message: `${(name + ':').padEnd(9, ' ')}${content}`,
    })),
  });

  consola.info(`Run ${playground}:${script}`);

  exec(`pnpm dev`);
  exec(`pnpm dev:watch & pnpm --filter @playground/${playground} ${script}`);
}
