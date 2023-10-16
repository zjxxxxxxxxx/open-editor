import { isFunc } from '@open-editor/shared';
import type { ResolveDebug } from '../resolveDebug';
import type { ElementSourceMeta } from '../resolveSource';
import { createReactResolver } from '../createReactResolver';
import { fiberResolver } from './react18';

let resolver: ReturnType<typeof createReactResolver<any>>;
function getResolver() {
  return (resolver ||= createReactResolver({
    isValid(owner) {
      if (owner?._currentElement) {
        return (
          isFunc(owner._currentElement.type) ||
          isFunc(owner._currentElement.type.render)
        );
      }
      return false;
    },
    getOwner(instance) {
      return instance?._currentElement._owner;
    },
    getSource(instance) {
      return instance?._currentElement._source;
    },
    getName(owner) {
      if (owner) {
        const component = isFunc(owner._currentElement.type)
          ? owner._currentElement.type
          : // React.forwardRef(Component)
            owner._currentElement.type.render;
        return component?.name || component?.displayName;
      }
    },
  }));
}

export function instanceResolver(
  instance: any | null | undefined,
  tree: Partial<ElementSourceMeta>[],
  deep = false,
) {
  return getResolver()(instance, tree, deep);
}

export function resolveReact15(
  { value: instance }: ResolveDebug,
  tree: Partial<ElementSourceMeta>[],
  deep = false,
) {
  if (instance && '_debugOwner' in instance) {
    fiberResolver(instance, tree, deep);
  } else {
    instanceResolver(instance, tree, deep);
  }
}
