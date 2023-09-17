import type { Fiber } from 'react-reconciler';
import { isFunc } from '@open-editor/shared';

import { ResolveDebug } from '../resolveDebug';
import { ElementSourceMeta } from '../resolveSource';
import { isValidFileName } from '../util';

export function resolveSourceFromReact(
  debug: ResolveDebug<Fiber>,
  deep?: boolean,
) {
  return resolveSourceFromFiber(debug.value, deep);
}

export function resolveSourceFromReact15(
  { value: instance }: ResolveDebug,
  deep?: boolean,
) {
  if (instance && '_debugOwner' in instance) {
    return resolveSourceFromFiber(instance, deep);
  }
  return resolveSourceFromInstance(instance, deep);
}

export function resolveSourceFromFiber(fiber?: Fiber | null, deep?: boolean) {
  const tree: Partial<ElementSourceMeta>[] = [];

  while (fiber) {
    let owner = fiber._debugOwner;

    const source = fiber._debugSource;
    if (source && isValidFileName(source.fileName)) {
      while (!isFiberComponent(owner)) {
        if (!owner) {
          return tree;
        }
        owner = owner._debugOwner;
      }

      tree.push({
        name: getFiberComponentName(owner as Fiber),
        file: source.fileName,
        line: source.lineNumber,
        column: (<any>source).columnNumber,
      });

      if (!deep) {
        return tree;
      }
    }

    fiber = owner;
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

  return tree;
}

export function resolveSourceFromInstance(
  instance?: any | null,
  deep?: boolean,
) {
  const tree: Partial<ElementSourceMeta>[] = [];

  while (instance) {
    let owner = instance._currentElement._owner;

    const source = instance._currentElement._source;
    if (source && isValidFileName(source.fileName)) {
      while (!isInstanceComponent(owner)) {
        if (!owner) {
          return tree;
        }
        owner = owner._currentElement._owner;
      }

      tree.push({
        name: getInstanceComponentName(owner),
        file: source.fileName,
        line: source.lineNumber,
        column: (<any>source).columnNumber,
      });

      if (!deep) {
        return tree;
      }
    }

    instance = owner;
  }

  function isInstanceComponent(owner?: any | null) {
    if (owner && owner._currentElement) {
      return (
        isFunc(owner._currentElement.type) ||
        isFunc(owner._currentElement.type.render)
      );
    }
    return false;
  }

  function getInstanceComponentName(owner: any) {
    const component = isFunc(owner._currentElement.type)
      ? owner._currentElement.type
      : // React.forwardRef(Component)
        owner._currentElement.type.render;
    return component?.name || component?.displayName;
  }

  return tree;
}
