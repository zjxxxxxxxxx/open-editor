import { ElementSourceMeta } from './resolveSource';
import { isValidFileName } from './util';

export interface ReactResolverOptions<T = any> {
  isValid(target: T): boolean;
  getOwner(target: T): T;
  getSource(target: T): any;
  getName(target: T): string | undefined;
}

export function createReactResolver<T = any>(options: ReactResolverOptions<T>) {
  const { isValid, getOwner, getSource, getName } = options;

  return function reactResolver(
    target: T,
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
          name: getName(owner),
          file: source.fileName,
          line: source.lineNumber,
          column: (<any>source).columnNumber,
        });

        if (!deep) return;
      }

      target = owner;
    }
  };
}
