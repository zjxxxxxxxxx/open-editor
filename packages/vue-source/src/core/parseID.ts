import { extname } from 'node:path';
import { DEBUG_SOURCE } from '@open-editor/shared';

export interface Query extends Record<string, any> {
  type?: 'script' | 'template' | 'style' | 'custom';
  raw?: string;
  [DEBUG_SOURCE]?: string;
}

export function parseID(id: string, rootDir = '') {
  const [file, rawQuery] = id.split('?', 2);
  const filename = file.startsWith(rootDir) ? file.replace(rootDir, '').replace(/^\//, '') : file;
  const ext = extname(file).slice(1);
  const query = (rawQuery ? Object.fromEntries(new URLSearchParams(rawQuery)) : {}) as Query;

  return {
    file: filename,
    isSfc: ext === 'vue',
    isJSX: ext === 'jsx',
    isTsx: ext === 'tsx',
    query,
  };
}
