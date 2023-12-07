import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolvePath } from './resolve';

const clientId = '@open-editor/client/client';
const template = <const>`import { setupClient } from './index';
if (typeof window !== 'undefined') {
  setupClient(__OPTIONS__)
}`;

export function createClient(url: string) {
  const filename = resolvePath(clientId, url);

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
