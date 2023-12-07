import type { ElementSourceMeta } from '../';
import type { ResolveDebug } from '../resolveDebug';
import { createVueResolver } from '../creators/createVueResolver';

export function resolveVue2(
  debug: ResolveDebug,
  tree: Partial<ElementSourceMeta>[],
  deep = false,
) {
  const componentInstance = debug.value._vnode.componentInstance;
  if (componentInstance) {
    debug.value = componentInstance;
  }
  ensureLazyResolver()(debug, tree, deep);
}

let resolver: ReturnType<typeof createVueResolver<any>>;
function ensureLazyResolver() {
  return (resolver ||= createVueResolver({
    isValid(inst) {
      return Boolean(inst?.$vnode);
    },
    isValidNext(inst) {
      return Boolean(inst.$parent?.$vnode);
    },
    getNext(inst) {
      return inst.$parent;
    },
    getSource(inst) {
      return inst.$props?.__source;
    },
    getFile(inst) {
      return getCtor(inst).__file || getCtor(inst).options?.__file;
    },
    getName(inst) {
      return getCtor(inst).options?.name;
    },
  }));

  function getCtor(inst: any) {
    return inst.$vnode.componentOptions.Ctor;
  }
}
