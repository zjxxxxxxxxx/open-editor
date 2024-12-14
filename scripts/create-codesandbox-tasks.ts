import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
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

  saveChanges();
}

function saveChanges() {
  execSync('git config --global user.email "954270063@qq.com"');
  execSync('git config --global user.name "zjxxxxxxxxx"');
  execSync('git add .');
  execSync(`git commit -m 'save changes: ${Date.now()}'`);
}
