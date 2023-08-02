import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolveNodeModuleFilename } from '@open-editor/shared/node';
import { extname } from 'node:path';

export const clientRuntimeFilename = resolveNodeModuleFilename(
  '@open-editor/client/runtime',
  import.meta.url,
);

const template = `if (typeof window !== 'undefined') {
  Promise.resolve(__IMPORT__('./index')).then(({ setupClient }) => {
    setupClient(__OPTIONS__);
  })
}` as const;

export function generateClientRuntime(options: object) {
  const temp = template.replace('__OPTIONS__', JSON.stringify(options));
  const importer =
    extname(clientRuntimeFilename) === '.cjs' ? 'require' : 'import';

  const oldCode = existsSync(clientRuntimeFilename)
    ? readFileSync(clientRuntimeFilename, 'utf-8')
    : undefined;
  const newCode = temp.replace('__IMPORT__', importer);

  if (oldCode !== oldCode) {
    writeFileSync(clientRuntimeFilename, newCode, 'utf-8');
  }
}
