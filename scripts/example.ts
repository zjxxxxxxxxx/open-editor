import { readdirSync } from 'node:fs';
import path from 'node:path';
import enquirer from 'enquirer';
import consola from 'consola';
import { exec, readjson, safeExit } from './utils';

safeExit(main);

async function main() {
  const examplesRoot = 'examples';

  const examplesPath = path.resolve(examplesRoot);
  const examples = readdirSync(examplesPath).filter(
    (example) => example !== '.D',
  );
  const { example } = await enquirer.prompt<{
    example: string;
  }>({
    type: 'select',
    name: 'example',
    message: 'Please select the example',
    choices: examples,
  });

  const packagePath = path.resolve(examplesRoot, example, 'package.json');
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
      message: `${(name + ':').padEnd(9)}${content}`,
    })),
  });

  consola.info(`Run ${example}:${script}`);

  exec(`pnpm dev`);
  exec(`pnpm dev:watch & pnpm --filter @example/${example} ${script}`);
}
