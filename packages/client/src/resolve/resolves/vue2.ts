import type { SourceCodeMeta } from '../';
import type { ResolveDebug } from '../resolveDebug';
import { createVueResolver } from '../creators/createVueResolver';

export function resolveVue2(
  debug: ResolveDebug,
  tree: Partial<SourceCodeMeta>[],
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
    isValid(inst): inst is any {
      return !!inst?.$vnode;
    },
    getNext,
    getSource,
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

  function getSource(inst: any) {
    while (inst) {
      if (inst.$props?.__source) {
        return inst.$props?.__source;
      }
      inst = getNext(inst);
    }
  }

  function getNext(inst: any) {
    return inst.$parent;
  }
}
