import { isFunc } from '@open-editor/shared';

import { ResolveDebug } from '../resolveDebug';
import { ElementSourceMeta } from '../resolveSource';
import { isValidFileName } from '../util';
import { resolveSourceFromFiber } from './react18';

export function resolveReact15(
  { value: instance }: ResolveDebug,
  tree: Partial<ElementSourceMeta>[],
  deep?: boolean,
) {
  if (instance && '_debugOwner' in instance) {
    return resolveSourceFromFiber(instance, tree, deep);
  }
  return resolveSourceFromInstance(instance, tree, deep);
}

export function resolveSourceFromInstance(
  instance: any | null | undefined,
  tree: Partial<ElementSourceMeta>[],
  deep?: boolean,
) {
  while (instance) {
    let owner = instance._currentElement._owner;

    const source = instance._currentElement._source;
    if (source && isValidFileName(source.fileName)) {
      while (!isInstanceComponent(owner)) {
        if (!owner) return;

        owner = owner._currentElement._owner;
      }

      tree.push({
        name: getInstanceComponentName(owner),
        file: source.fileName,
        line: source.lineNumber,
        column: (<any>source).columnNumber,
      });

      if (!deep) return;
    }

    instance = owner;
  }
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
