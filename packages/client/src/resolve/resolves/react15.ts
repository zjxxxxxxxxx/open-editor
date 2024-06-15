import { isFn, hasOwnProperty } from '@open-editor/shared';
import type { SourceCodeMeta } from '../';
import type { ResolveDebug } from '../resolveDebug';
import {
  type ReactResolver,
  createReactResolver,
} from '../creators/createReactResolver';
import { resolveForFiber } from './react17';

export function resolveReact15(
  { value: inst }: ResolveDebug,
  tree: Partial<SourceCodeMeta>[],
  deep = false,
) {
  if (inst && hasOwnProperty<any, any>(inst, '_debugOwner')) {
    resolveForFiber(inst, tree, deep);
  } else {
    resolveForInstance(inst, tree, deep);
  }
}

let resolver: ReactResolver;
export function resolveForInstance(
  inst: any | null | undefined,
  tree: Partial<SourceCodeMeta>[],
  deep = false,
) {
  setupResolver();
  resolver(inst, tree, deep);
}

function setupResolver() {
  resolver ||= createReactResolver({
    isValid(owner) {
      const el = owner?._currentElement;
      if (el) {
        return isFn(el.type) || isFn(el.type.render);
      }
      return false;
    },
    getNext(inst) {
      return inst._currentElement?._owner;
    },
    getSource(inst) {
      return inst._currentElement?._source;
    },
    getName(owner) {
      const el = owner._currentElement;
      if (el) {
        const c = isFn(el.type)
          ? el.type
          : // React.forwardRef(Component)
            el.type.render;
        return c?.name || c?.displayName;
      }
    },
  });
}
