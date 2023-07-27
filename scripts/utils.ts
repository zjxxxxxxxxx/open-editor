import { isPromise } from 'util/types';
import { ExecSyncOptions, execSync } from 'child_process';
import { PathOrFileDescriptor, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

// Project root
export const __dirname = fileURLToPath(new URL('../', import.meta.url));

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
