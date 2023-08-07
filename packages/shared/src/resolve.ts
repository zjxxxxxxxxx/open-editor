import { createRequire } from 'node:module';

export function resolvePath(path: string, url: string) {
  return createRequire(url).resolve(path);
}
