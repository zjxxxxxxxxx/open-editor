import type { Fiber } from 'react-reconciler';
import { isFunc } from '@open-editor/shared';

import type { ResolveDebug } from '../resolveDebug';
import type { ElementSourceMeta } from '../resolveSource';
import { createReactResolver } from '../createReactResolver';

let resolver: ReturnType<typeof createReactResolver<Fiber | null | undefined>>;
function createResolver() {
  resolver = createReactResolver({
    isValid(owner) {
      if (owner?._debugSource) {
        return isFunc(owner.type) || isFunc(owner.type.render);
      }
      return false;
    },
    getOwner: (target) => target?._debugOwner,
    getSource: (target) => target?._debugSource,
    getName(owner) {
      if (owner) {
        const component = isFunc(owner.type)
          ? owner.type
          : // React.forwardRef(Component)
            owner.type.render;
        return component?.name || component?.displayName;
      }
    },
  });
}

export function fiberResolver(
  debug: ResolveDebug<Fiber>,
  tree: Partial<ElementSourceMeta>[],
  deep = false,
) {
  if (!resolver) createResolver();
  resolver(debug.value, tree, deep);
}

export function resolveReact18(
  debug: ResolveDebug<Fiber>,
  tree: Partial<ElementSourceMeta>[],
  deep = false,
) {
  fiberResolver(debug, tree, deep);
}
