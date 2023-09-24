import type { ResolveDebug } from '../resolveDebug';
import type { ElementSourceMeta } from '../resolveSource';
import { createVueResolver } from '../createVueResolver';

let resolver: ReturnType<typeof createVueResolver<any>>;
function createResolver() {
  resolver = createVueResolver({
    isValid: (instance) => Boolean(instance?.$vnode),
    isValidNext: (instance) => Boolean(instance.$parent?.$vnode),
    getNext: (instance) => instance.$parent,
    getSource: (instance) => instance.$props?.__source,
    getFile: (instance) =>
      getCtor(instance).__file ?? getCtor(instance).options?.__file,
    getName: (instance) => getCtor(instance).options?.name,
  });

  function getCtor(instance: any) {
    return instance.$vnode.componentOptions.Ctor;
  }
}

export function resolveVue2(
  debug: ResolveDebug,
  tree: Partial<ElementSourceMeta>[],
  deep = false,
) {
  const componentInstance = debug.value._vnode.componentInstance;
  if (componentInstance) {
    debug.value = componentInstance;
  }

  if (!resolver) createResolver();
  resolver(debug, tree, deep);
}
