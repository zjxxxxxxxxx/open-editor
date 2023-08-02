import { writeFileSync } from 'node:fs';
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
  const ext = extname(clientRuntimeFilename);
  const temp = template.replace('__OPTIONS__', JSON.stringify(options));

  writeFileSync(
    clientRuntimeFilename,
    temp.replace('__IMPORT__', ext === '.cjs' ? 'require' : 'import'),
    'utf-8',
  );
}
