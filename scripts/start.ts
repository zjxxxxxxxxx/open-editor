import { resolve } from 'node:path';
import consola from 'consola';
import enquirer from 'enquirer';
import minimist from 'minimist';

import {
  exec,
  playgrounds,
  projectRoot,
  readjson,
  rollupRoot,
  viteRoot,
  webpackRoot,
} from './utils';

main();

async function main() {
  try {
    const { playground = await selectPlayground(), script = await selectScript(playground) } =
      minimist(process.argv.slice(1));

    let packagePath: string;
    if (playground.includes('rollup')) {
      packagePath = rollupRoot;
    } else if (playground.includes('vite')) {
      packagePath = viteRoot;
    } else {
      packagePath = webpackRoot;
    }

    consola.info(`Link ${packagePath}`);
    exec(
      [
        `cd ${resolve(projectRoot, `playgrounds/${playground}`)}`,
        `pnpm link ${packagePath}`,
        `cd ${projectRoot}`,
      ].join(' && '),
    );

    consola.info(`Run ${playground}:${script}`);
    exec(`pnpm --filter @playground/${playground} ${script}`);
  } catch {
    consola.error('exit');
    process.exit();
  }
}

async function selectPlayground() {
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
