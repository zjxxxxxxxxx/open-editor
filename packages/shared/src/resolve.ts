import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function resolvePath(path: string, url: string) {
  return join(dirname(fileURLToPath(url)), path);
}

export function resolveFilename(path: string, url: string) {
  return `${resolvePath(path, url)}${extname(url)}`;
}

export function resolveNodeModuleFilename(mod: string, url: string) {
  let referencePath = dirname(fileURLToPath(url));

  while (referencePath) {
    const modsPath = join(referencePath, '/node_modules');

    if (existsSync(modsPath)) {
      const modPaths = mod.split('/');
      const slicePath = (start: number, end?: number) =>
        modPaths.slice(start, end).join('/');

      const normalJson = resolveJSON(modsPath, slicePath(0, 1));
      if (normalJson) {
        return resolveModFilename(normalJson, slicePath(1), url);
      }

      if (modPaths.length > 1) {
        const monorepoJson = resolveJSON(modsPath, slicePath(0, 2));
        if (monorepoJson) {
          return resolveModFilename(monorepoJson, slicePath(2), url);
        }
      }
    }

    referencePath = referencePath.replace(/\/[^/]+$/, '');
  }

  throw Error('@open-editor/shared: resolveNodeModule messing.');
}

function resolveJSON(modsPath: string, modPath: string) {
  const moduleFullPath = join(modsPath, modPath);
  const jsonPath = join(moduleFullPath, 'package.json');
  if (existsSync(jsonPath)) {
    const json = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    json.path = moduleFullPath;
    return json;
  }
}

function resolveModFilename(json: any, subPath: string, url: string) {
  const exoprtName = extname(url) === 'cjs' ? 'require' : 'import';
  const subFullPath = `./${subPath}`;
  const exports =
    subFullPath === './'
      ? json.exports['.'] ?? json.exports['./']
      : json.exports[subFullPath];
  return join(json.path, exports[exoprtName]);
}
