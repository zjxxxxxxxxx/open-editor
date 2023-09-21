import type { ResolveDebug } from '../resolveDebug';
import type { ElementSourceMeta } from '../resolveSource';
import { createVueResolver } from '../createVueResolver';

let resolver: ReturnType<typeof createVueResolver<any>>;
function createResolver() {
  resolver = createVueResolver({
    isValid: (instance) => Boolean(instance?.$vnode),
    isValidNext: (instance) => Boolean(instance.$parent.$vnode),
    getNext: (instance) => instance.$parent,
    getVueSource: (instance) =>
      <string>instance.$vnode.componentInstance?.$props?.__source,
    getFile(instance) {
      const { Ctor } = instance.$vnode.componentOptions;
      return Ctor?.__file ?? Ctor.options?.__file;
    },
    getName(instance) {
      const { Ctor } = instance.$vnode.componentOptions;
      return Ctor.options?.name;
    },
  });
}

export function resolveVue2(
  debug: ResolveDebug,
  tree: Partial<ElementSourceMeta>[],
  deep = false,
) {
  if (debug.value._vnode.componentInstance) {
    debug.value = debug.value._vnode.componentInstance;
  }

  if (!resolver) createResolver();
  resolver(debug, tree, deep);
}
