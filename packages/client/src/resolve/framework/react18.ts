import type { Fiber } from 'react-reconciler';
import { isFunc } from '@open-editor/shared';

import type { ResolveDebug } from '../resolveDebug';
import type { ElementSourceMeta } from '../resolveSource';
import { isValidFileName } from '../util';

export function resolveReact18(
  debug: ResolveDebug<Fiber>,
  tree: Partial<ElementSourceMeta>[],
  deep?: boolean,
) {
  return resolveSourceFromFiber(debug.value, tree, deep);
}

export function resolveSourceFromFiber(
  fiber: Fiber | null | undefined,
  tree: Partial<ElementSourceMeta>[],
  deep?: boolean,
) {
  while (fiber) {
    let owner = fiber._debugOwner;

    const source = fiber._debugSource;
    if (source && isValidFileName(source.fileName)) {
      while (!isFiberComponent(owner)) {
        if (!owner) return;

        owner = owner._debugOwner;
      }

      tree.push({
        name: getFiberComponentName(owner as Fiber),
        file: source.fileName,
        line: source.lineNumber,
        column: (<any>source).columnNumber,
      });

      if (!deep) return;
    }

    fiber = owner;
  }
}

function isFiberComponent(owner?: Fiber | null) {
  if (owner && owner._debugSource) {
    return isFunc(owner.type) || isFunc(owner.type.render);
  }
  return false;
}

function getFiberComponentName(owner: Fiber) {
  const component = isFunc(owner.type)
    ? owner.type
    : // React.forwardRef(Component)
      owner.type.render;
  return component?.name || component?.displayName;
}
