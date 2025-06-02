import { extname, relative } from 'node:path';
import { normalizePath } from '@open-editor/shared';

export function parseID(id: string, rootDir: string) {
  const [filename] = normalizePath(id).split('?', 2);
  const file = relative(rootDir, filename);
  const ext = extname(file).slice(1);

  return {
    file,
    isJSX: ext === 'jsx',
    isTsx: ext === 'tsx',
  };
}
