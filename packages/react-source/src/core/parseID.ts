import { extname } from 'node:path';

export function parseID(id: string, rootDir: string) {
  const [file] = id.split('?', 2);
  const filename = file.startsWith(rootDir) ? file.replace(rootDir, '').replace(/^\//, '') : file;
  const ext = extname(file).slice(1);

  return {
    file: filename,
    isJSX: ext === 'jsx',
    isTsx: ext === 'tsx',
  };
}
