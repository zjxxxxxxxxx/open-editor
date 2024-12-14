import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { playgrounds, projectRoot, readjson, writejson } from './utils';

main();

function main() {
  const taskPath = resolve(projectRoot, '.codesandbox/tasks.json');
  const taskJson = readjson(taskPath);

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

  writejson(taskPath, taskJson);

  saveChanges();
}

function saveChanges() {
  const [userName, userEmail] = readjson(resolve(projectRoot, 'package.json'))
    .author.replace(/<|>/g, '')
    .split(' ');

  execSync(`git config user.name '${userName}'`);
  execSync(`git config user.email '${userEmail}'`);
  execSync('git add .');
  execSync(`git commit -m 'save changes: ${Date.now()}'`);
}
