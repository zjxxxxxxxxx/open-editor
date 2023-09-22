import type { ElementSourceMeta } from './resolveSource';
import { isValidFileName } from './util';

export interface ReactResolverOptions<T = any> {
  isValid(current?: T | null): boolean;
  getOwner(current?: T | null): T | null | undefined;
  getSource(current?: T | null): any;
  getName(current?: T | null): string | undefined;
}

export function createReactResolver<T = any>(options: ReactResolverOptions<T>) {
  const { isValid, getOwner, getSource, getName } = options;

  return function reactResolver(
    current: T | null | undefined,
    tree: Partial<ElementSourceMeta>[],
    deep: boolean,
  ) {
    while (current) {
      let owner = getOwner(current);

      const source = getSource(current);
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

      current = owner;
    }
  };
}
