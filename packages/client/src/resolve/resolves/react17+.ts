import type { Fiber } from 'react-reconciler';
import { isFn } from '@open-editor/shared';
import type { SourceCodeMeta } from '../';
import type { ResolveDebug } from '../resolveDebug';
import { createReactResolver } from '../creators/createReactResolver';

export function resolveReact17Plus(
  { value: fiber }: ResolveDebug<Fiber>,
  tree: Partial<SourceCodeMeta>[],
  deep = false,
) {
  resolveByFiber(fiber, tree, deep);
}

export function resolveByFiber(
  fiber: Fiber | null | undefined,
  tree: Partial<SourceCodeMeta>[],
  deep = false,
) {
  ensureLazyResolver()(fiber, tree, deep);
}

let resolver: ReturnType<typeof createReactResolver<Fiber>>;
function ensureLazyResolver() {
  return (resolver ||= createReactResolver({
    isValid(owner) {
      if (owner?._debugSource) {
        return isFn(owner.type) || isFn(owner.type.render);
      }
      return false;
    },
    getNext(fiber) {
      return fiber?._debugOwner;
    },
    getSource(fiber) {
      return fiber?._debugSource;
    },
    getName(owner) {
      if (owner) {
        const comp = isFn(owner.type)
          ? owner.type
          : // React.forwardRef(Component)
            owner.type.render;
        return comp?.name || comp?.displayName;
      }
    },
  }));
}
