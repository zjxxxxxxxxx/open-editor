import { extname, relative } from 'node:path';
import { normalizePath } from '@open-editor/shared';
import { DS } from '@open-editor/shared/debugSource';

export interface Query extends Record<string, any> {
  type?: 'script' | 'template' | 'style' | 'custom';
  raw?: string;
  [DS.ID]?: string;
}

export function parseID(id: string, rootDir: string) {
  const [filename, rawQuery] = normalizePath(id).split('?', 2);
  const file = relative(rootDir, filename);
  const ext = extname(file).slice(1);
  const query = (rawQuery ? Object.fromEntries(new URLSearchParams(rawQuery)) : {}) as Query;

  return {
    file,
    isSfc: ext === 'vue',
    isJSX: ext === 'jsx',
    isTsx: ext === 'tsx',
    query,
  };
}
