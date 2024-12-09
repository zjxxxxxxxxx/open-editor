import { resolve } from 'node:path';
import { playgrounds, readjson, writejson } from './utils';

const TASKS_PATH = resolve('.codesandbox/tasks.json');

main();

function main() {
  const taskJson = readjson(TASKS_PATH);

  let port = 4000;
  playgrounds.forEach((name) => {
    taskJson.tasks[name] = {
      name: `Preview ${name}`,
      command: `pnpm --filter @playground/${name} dev`,
      runAtStart: true,
      preview: {
        port: port++,
        prLink: 'direct',
      },
    };
  });

  writejson(TASKS_PATH, taskJson);
}
