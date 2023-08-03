import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolveNodeModuleFilename } from './resolve';
import { dirname } from 'node:path';

const template = `if (typeof window !== 'undefined') {
  import('./index').then(({ setupClient }) => {
    setupClient(__OPTIONS__);
  })
}` as const;

export function createRuntime(url: string) {
  const dir = dirname(resolveNodeModuleFilename('@open-editor/client', url));
  const filename = `${dir}/runtime.js`;

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
