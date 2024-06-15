import type { Fiber } from 'react-reconciler';
import { isFn } from '@open-editor/shared';
import {
  type ReactResolver,
  createReactResolver,
} from '../creators/createReactResolver';
import type { SourceCodeMeta } from '../index';
import type { ResolveDebug } from '../resolveDebug';

export function resolveReact17(
  { value: fiber }: ResolveDebug<Fiber>,
  tree: Partial<SourceCodeMeta>[],
  deep = false,
) {
  resolveForFiber(fiber, tree, deep);
}

let resolver: ReactResolver<Fiber>;
export function resolveForFiber(
  fiber: Fiber | null | undefined,
  tree: Partial<SourceCodeMeta>[],
  deep = false,
) {
  setupResolver();
  resolver(fiber, tree, deep);
}

function setupResolver() {
  resolver ||= createReactResolver({
    isValid(owner) {
      if (owner?._debugSource) {
        return isFn(owner.type) || isFn(owner.type.render);
      }
      return false;
    },
    getNext(fiber) {
      return fiber._debugOwner;
    },
    getSource(fiber) {
      return fiber._debugSource;
    },
    getName(owner) {
      if (owner) {
        const c = isFn(owner.type)
          ? owner.type
          : // React.forwardRef(Component)
            owner.type.render;
        return c?.name || c?.displayName;
      }
    },
  });
}
