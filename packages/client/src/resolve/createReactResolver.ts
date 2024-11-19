import { normalizePath } from '@open-editor/shared';
import { type Source } from 'react-reconciler';
import { type CodeSourceMeta } from './index';
import { ensureFileName, isValidFileName } from './resolveUtil';

export interface ReactResolverOptions<T = any> {
  isValid(v?: T): boolean;
  getNext(v: T): T | null | undefined;
  getSource(v: T): (Source & { columnNumber?: number }) | null | undefined;
  getName(v: T): string | undefined;
}

export type ReactResolver<T = any> = ReturnType<typeof createReactResolver<T>>;

export function createReactResolver<T = any>(opts: ReactResolverOptions<T>) {
  const { isValid, getNext, getSource, getName } = opts;

  function reactResolver(
    cur: T | null | undefined,
    tree: Partial<CodeSourceMeta>[],
    deep: boolean,
  ) {
    while (cur) {
      const source = normalizeSource(getSource(cur));
      let next = getNext(cur);

      if (isValidFileName(source?.fileName)) {
        while (!isValid(next!)) {
          if (!next) return;

          next = getNext(next);
        }

        tree.push({
          name: getName(next!),
          file: source!.fileName,
          line: source!.lineNumber,
          column: source!.columnNumber,
        });

        if (!deep) return;
      }

      cur = next;
    }
  }

  function normalizeSource(
    source: (Source & { columnNumber?: number }) | null | undefined,
  ) {
    if (source) {
      source.fileName = ensureFileName(normalizePath(source.fileName));
    }
    return source;
  }

  return reactResolver;
}
