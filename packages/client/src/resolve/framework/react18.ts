import type { Fiber } from 'react-reconciler';
import { isFunc } from '@open-editor/shared';
import type { ResolveDebug } from '../resolveDebug';
import type { ElementSourceMeta } from '../resolveSource';
import { createReactResolver } from '../createReactResolver';

let resolver: ReturnType<typeof createReactResolver<Fiber>>;
function getResolver() {
  return (resolver ||= createReactResolver({
    isValid(owner) {
      if (owner?._debugSource) {
        return isFunc(owner.type) || isFunc(owner.type.render);
      }
      return false;
    },
    getOwner(fiber) {
      return fiber?._debugOwner;
    },
    getSource(fiber) {
      return fiber?._debugSource;
    },
    getName(owner) {
      if (owner) {
        const component = isFunc(owner.type)
          ? owner.type
          : // React.forwardRef(Component)
            owner.type.render;
        return component?.name || component?.displayName;
      }
    },
  }));
}

export function fiberResolver(
  fiber: Fiber | null | undefined,
  tree: Partial<ElementSourceMeta>[],
  deep = false,
) {
  return getResolver()(fiber, tree, deep);
}

export function resolveReact18(
  { value: fiber }: ResolveDebug<Fiber>,
  tree: Partial<ElementSourceMeta>[],
  deep = false,
) {
  fiberResolver(fiber, tree, deep);
}
