import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolvePath } from './resolve';

const clientId = '@open-editor/client/client';
const syncTemplate = <const>`
import { setupClient } from './index';
if (typeof window !== 'undefined') {
  setupClient(__OPTIONS__);
}
`;
const asyncTemplate = <const>` 
if (typeof window !== 'undefined') {
  if (typeof require !== 'undefined') {
    const { setupClient } = require('./index.js');
    setupClient(__OPTIONS__);
  } else {
    import('./index.mjs').then(({ setupClient }) => {
      setupClient(__OPTIONS__);
    })
  }
}
`;

export function createClient(url: string) {
  const filename = resolvePath(clientId, url);

  function generate(options: object, dynamicImport = false) {
    const oldCode = existsSync(filename)
      ? readFileSync(filename, 'utf-8')
      : undefined;
    const template = dynamicImport ? asyncTemplate : syncTemplate;
    const newCode = template.replace(/__OPTIONS__/g, JSON.stringify(options));

    if (newCode !== oldCode) {
      writeFileSync(filename, newCode, 'utf-8');
    }
  }

  return {
    filename,
    generate,
  };
}
