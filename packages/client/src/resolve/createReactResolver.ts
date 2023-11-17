import type { ElementSourceMeta } from './resolveSource';
import { isValidFileName } from './util';

export interface ReactResolverOptions<T = any> {
  isValid(current?: T | null): boolean;
  getOwner(current?: T | null): T | null | undefined;
  getSource(current?: T | null): any;
  getName(current?: T | null): string | undefined;
}

export function createReactResolver<T = any>(opts: ReactResolverOptions<T>) {
  const { isValid, getOwner, getSource, getName } = opts;

  return function reactResolver(
    cur: T | null | undefined,
    tree: Partial<ElementSourceMeta>[],
    deep: boolean,
  ) {
    while (cur) {
      let owner = getOwner(cur);

      const source = getSource(cur);
      if (isValidFileName(source?.fileName)) {
        while (!isValid(owner)) {
          if (!owner) return;
          owner = getOwner(owner);
        }

        tree.push({
          name: getName(owner!),
          file: source.fileName,
          line: source.lineNumber,
          column: source.columnNumber,
        });

        if (!deep) return;
      }

      cur = owner;
    }
  };
}
