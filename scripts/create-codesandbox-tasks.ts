import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { readjson, writejson } from './utils';

const TASKS_PATH = resolve('.codesandbox/tasks.json');

const taskJson = readjson(TASKS_PATH);
const names = readdirSync(resolve('playground'));

let port = 4000;
names.flatMap((name) => {
  const task = `@playground/${name}`;
  taskJson.tasks[name] = {
    name: `Preview ${task}`,
    command: `pnpm --filter ${task} dev`,
    runAtStart: false,
    preview: {
      port: port++,
      prLink: 'devtool',
    },
  };
});

writejson(TASKS_PATH, taskJson);
