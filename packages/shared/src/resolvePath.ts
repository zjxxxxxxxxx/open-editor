import { createRequire } from 'node:module';
import { normalizePath } from './normalizePath';

export function resolvePath(path: string, url: string) {
  return createRequire(normalizePath(url)).resolve(normalizePath(path));
}
