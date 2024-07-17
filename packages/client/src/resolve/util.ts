import { isStr } from '@open-editor/shared';
import { Minimatch } from 'minimatch';
import { getOptions } from '../options';

export function ensureFileName(fileName: string) {
  const { rootDir } = getOptions();
  if (fileName.startsWith(rootDir)) {
    fileName = fileName.replace(rootDir, '').replace(/^\//, '');
  }
  return fileName;
}

const invalidRE = /^\/home\/runner\//;
export function isValidFileName(fileName?: string | null): fileName is string {
  if (fileName) {
    fileName = fileName.startsWith('/') ? fileName : `/${fileName}`;
    return !invalidRE.test(fileName) && filter(fileName);
  }

  return false;
}

const globs: Minimatch[] = [];

function filter(fileName: string) {
  setupGlobs();

  if (globs.length) {
    return globs.every((glob) => !glob.match(fileName));
  }

  return true;
}

function setupGlobs() {
  if (globs.length) return;

  const { ignoreComponents } = getOptions();
  const patterns = isStr(ignoreComponents)
    ? [ignoreComponents]
    : (ignoreComponents ?? []);

  patterns.forEach((pattern) => {
    globs.push(new Minimatch(pattern, { dot: true }));
  });
}
