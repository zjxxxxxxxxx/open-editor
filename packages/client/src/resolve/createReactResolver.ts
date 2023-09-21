import type { ElementSourceMeta } from './resolveSource';
import { isValidFileName } from './util';

export interface ReactResolverOptions<T = any> {
  isValid(target?: T | null): boolean;
  getOwner(target?: T | null): T | null | undefined;
  getSource(target?: T | null): any;
  getName(target?: T | null): string | undefined;
}

export function createReactResolver<T = any>(options: ReactResolverOptions<T>) {
  const { isValid, getOwner, getSource, getName } = options;

  return function reactResolver(
    target: T | null | undefined,
    tree: Partial<ElementSourceMeta>[],
    deep: boolean,
  ) {
    while (target) {
      let owner = getOwner(target);

      const source = getSource(target);
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

      target = owner;
    }
  };
}
