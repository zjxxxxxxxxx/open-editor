import type { Fiber } from 'react-reconciler';
import { isFunc } from '@open-editor/shared';

import { ElementSourceMeta } from '../resolveSource';

export function resolveSourceFromReact(fiber?: Fiber | null, deep?: boolean) {
  const tree: Partial<ElementSourceMeta>[] = [];

  while (fiber) {
    let owner = fiber._debugOwner;

    const source = fiber._debugSource;
    if (source) {
      while (!isReactComponent(owner)) {
        if (!owner) {
          return tree;
        }
        owner = owner._debugOwner;
      }

      tree.push({
        name: getReactComponentName(owner as Fiber),
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

  return tree;
}

function isReactComponent(owner?: Fiber | null) {
  if (owner && owner._debugSource) {
    return isFunc(owner.type) || isFunc(owner.type.render);
  }
  return false;
}

function getReactComponentName(owner: Fiber) {
  const component = isFunc(owner.type)
    ? owner.type
    : // React.forwardRef(Component)
      owner.type.render;
  return component?.name || component?.displayName;
}

export function resolveSourceFromReact15(
  instance?: any | null,
  deep?: boolean,
) {
  const tree: Partial<ElementSourceMeta>[] = [];

  while (instance) {
    let owner = instance._currentElement._owner;

    const source = instance._currentElement._source;
    if (source) {
      while (!isReact15Component(owner)) {
        if (!owner) {
          return tree;
        }
        owner = owner._currentElement._owner;
      }

      tree.push({
        name: getReact15ComponentName(owner),
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

  return tree;
}

function isReact15Component(owner?: any | null) {
  if (owner && owner._currentElement) {
    return (
      isFunc(owner._currentElement.type) ||
      isFunc(owner._currentElement.type.render)
    );
  }
  return false;
}

function getReact15ComponentName(owner: any) {
  const component = isFunc(owner._currentElement.type)
    ? owner._currentElement.type
    : // React.forwardRef(Component)
      owner._currentElement.type.render;
  return component?.name || component?.displayName;
}
