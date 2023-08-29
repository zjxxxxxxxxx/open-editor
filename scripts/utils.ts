import { isPromise } from 'node:util/types';
import { ExecSyncOptions, execSync } from 'node:child_process';
import { PathOrFileDescriptor, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'node:path';

// Project root
export const projectRoot = joinURLToPath(import.meta.url, '../');
// Package client root
export const clientRoot = resolve(projectRoot, 'packages/client');
// Package shared root
export const sharedRoot = resolve(projectRoot, 'packages/shared');

export function joinURLToPath(url: string, relative: string) {
  return fileURLToPath(new URL(relative, url));
}

export function readjson(path: PathOrFileDescriptor) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

export function writejson(path: PathOrFileDescriptor, data: object | string) {
  return writeFileSync(
    path,
    typeof data === 'string' ? data : JSON.stringify(data, null, 2) + '\n',
    'utf-8',
  );
}

export const exec = (command: string, options: ExecSyncOptions = {}) =>
  execSync(command, {
    stdio: 'inherit',
    encoding: 'utf-8',
    ...options,
  });

export function safeExit(run: () => unknown | void) {
  try {
    const p = run();

    if (isPromise(p)) {
      return p.catch(() => process.exit(1));
    }
  } catch {
    process.exit(1);
  }
}
