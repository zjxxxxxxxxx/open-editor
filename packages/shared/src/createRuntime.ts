import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolvePath } from './resolve';

const runtimeId = '@open-editor/client/runtime';
const template = <const>`import { setupClient } from './index';
if (typeof window !== 'undefined') {
  setupClient(__OPTIONS__)
}`;

export function createRuntime(url: string) {
  const filename = resolvePath(runtimeId, url);

  function generate(options: object) {
    const oldCode = existsSync(filename)
      ? readFileSync(filename, 'utf-8')
      : undefined;
    const newCode = template.replace('__OPTIONS__', JSON.stringify(options));

    if (newCode !== oldCode) {
      writeFileSync(filename, newCode, 'utf-8');
    }
  }

  return {
    filename,
    generate,
  };
}
