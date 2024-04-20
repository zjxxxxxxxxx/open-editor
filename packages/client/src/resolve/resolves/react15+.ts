import { isFn, hasOwnProperty } from '@open-editor/shared';
import type { SourceCodeMeta } from '../';
import type { ResolveDebug } from '../resolveDebug';
import { createReactResolver } from '../creators/createReactResolver';
import { resolveByFiber } from './react17+';

export function resolveReact15Plus(
  { value: inst }: ResolveDebug,
  tree: Partial<SourceCodeMeta>[],
  deep = false,
) {
  if (inst && hasOwnProperty<any, any>(inst, '_debugOwner')) {
    resolveByFiber(inst, tree, deep);
  } else {
    resolveByInstance(inst, tree, deep);
  }
}

export function resolveByInstance(
  inst: any | null | undefined,
  tree: Partial<SourceCodeMeta>[],
  deep = false,
) {
  ensureLazyResolver()(inst, tree, deep);
}

let resolver: ReturnType<typeof createReactResolver<any>>;
function ensureLazyResolver() {
  return (resolver ||= createReactResolver({
    isValid(owner) {
      const el = getEl(owner);
      if (el) {
        return isFn(el.type) || isFn(el.type.render);
      }
      return false;
    },
    getNext(inst) {
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
