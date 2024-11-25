import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { readjson, writejson } from './utils';

const TASKS_PATH = resolve('.codesandbox/tasks.json');

const taskJson = readjson(TASKS_PATH);
const names = readdirSync(resolve('playground'));

let port = 3000;
names.flatMap((name) => {
  const task = `@playground/${name}`;
  taskJson.tasks[name] = {
    name: `Run ${task}`,
    command: `pnpm --filter ${task} dev`,
    preview: {
      port: ++port,
      prLink: 'direct',
    },
  };
});

writejson(TASKS_PATH, taskJson);
