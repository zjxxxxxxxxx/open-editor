import type { SourceCodeMeta } from '../';
import { isValidFileName } from '../util';

export interface ReactResolverOptions<T = any> {
  isValid(current?: T | null): boolean;
  getNext(current?: T | null): T | null | undefined;
  getSource(current?: T | null): any;
  getName(current?: T | null): string | undefined;
}

export function createReactResolver<T = any>(opts: ReactResolverOptions<T>) {
  const { isValid, getNext, getSource, getName } = opts;

  return function reactResolver(
    cur: T | null | undefined,
    tree: Partial<SourceCodeMeta>[],
    deep: boolean,
  ) {
    while (cur) {
      const source = getSource(cur);
      let next = getNext(cur);
      if (isValidFileName(source?.fileName)) {
        while (!isValid(next)) {
          if (!next) return;
          next = getNext(next);
        }
        tree.push({
          name: getName(next!),
          file: source.fileName,
          line: source.lineNumber,
          column: source.columnNumber,
        });
        if (!deep) return;
      }
      cur = next;
    }
  };
}
