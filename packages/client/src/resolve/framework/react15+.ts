import { isFn } from '@open-editor/shared';
import type { ResolveDebug } from '../resolveDebug';
import type { ElementSourceMeta } from '../resolveSource';
import { createReactResolver } from '../createReactResolver';
import { fiberResolver } from './react17+';

export function resolveReact15Plus(
  { value: inst }: ResolveDebug,
  tree: Partial<ElementSourceMeta>[],
  deep = false,
) {
  if (inst && '_debugOwner' in inst) {
    fiberResolver(inst, tree, deep);
  } else {
    instanceResolver(inst, tree, deep);
  }
}

export function instanceResolver(
  inst: any | null | undefined,
  tree: Partial<ElementSourceMeta>[],
  deep = false,
) {
  return getResolver()(inst, tree, deep);
}

let resolver: ReturnType<typeof createReactResolver<any>>;
function getResolver() {
  return (resolver ||= createReactResolver({
    isValid(owner) {
      const el = getEl(owner);
      if (el) {
        return isFn(el.type) || isFn(el.type.render);
      }
      return false;
    },
    getOwner(inst) {
      return getEl(inst)?._owner;
    },
    getSource(inst) {
      return getEl(inst)?._source;
    },
    getName(owner) {
      const el = getEl(owner);
      if (el) {
        const comp = isFn(el.type)
          ? el.type
          : // React.forwardRef(Component)
            el.type.render;
        return comp?.name || comp?.displayName;
      }
    },
  }));

  function getEl(inst: any) {
    return inst?._currentElement;
  }
}
