import type { Fiber } from 'react-reconciler';
import { isFn } from '@open-editor/shared';
import type { ResolveDebug } from '../resolveDebug';
import type { ElementSourceMeta } from '../resolveSource';
import { createReactResolver } from '../createReactResolver';

export function resolveReact17Plus(
  { value: fiber }: ResolveDebug<Fiber>,
  tree: Partial<ElementSourceMeta>[],
  deep = false,
) {
  fiberResolver(fiber, tree, deep);
}

export function fiberResolver(
  fiber: Fiber | null | undefined,
  tree: Partial<ElementSourceMeta>[],
  deep = false,
) {
  return getResolver()(fiber, tree, deep);
}

let resolver: ReturnType<typeof createReactResolver<Fiber>>;
function getResolver() {
  return (resolver ||= createReactResolver({
    isValid(owner) {
      if (owner?._debugSource) {
        return isFn(owner.type) || isFn(owner.type.render);
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
        const component = isFn(owner.type)
          ? owner.type
          : // React.forwardRef(Component)
            owner.type.render;
        return component?.name || component?.displayName;
      }
    },
  }));
}
