import type { Source } from 'react-reconciler';
import type { SourceCodeMeta } from '../';
import { isValidFileName } from '../util';

export interface ReactResolverOptions<T = any> {
  isValid(v: T): boolean;
  getNext(v: T): T | null | undefined;
  getSource(v: T): (Source & { columnNumber?: number }) | null | undefined;
  getName(v: T): string | undefined;
}

export function createReactResolver<T = any>(opts: ReactResolverOptions<T>) {
  const { isValid, getNext, getSource, getName } = opts;

  function reactResolver(
    cur: T | null | undefined,
    tree: Partial<SourceCodeMeta>[],
    deep: boolean,
  ) {
    while (cur) {
      const source = getSource(cur);
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

  return reactResolver;
}
