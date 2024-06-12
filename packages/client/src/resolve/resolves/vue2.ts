import { createVueResolver } from '../creators/createVueResolver';
import type { SourceCodeMeta } from '../index';
import type { ResolveDebug } from '../resolveDebug';

let resolver: ReturnType<typeof createVueResolver<any>>;
export function resolveVue2(
  debug: ResolveDebug,
  tree: Partial<SourceCodeMeta>[],
  deep = false,
) {
  const componentInstance = debug.value._vnode.componentInstance;
  if (componentInstance) {
    debug.value = componentInstance;
  }
  setupResolver();
  resolver(debug, tree, deep);
}

function setupResolver() {
  resolver ||= createVueResolver({
    isValid(inst): inst is any {
      return !!inst?.$vnode;
    },
    getNext(inst) {
      return inst.$parent;
    },
    getSource(inst) {
      while (inst) {
        const source = inst.$props?.__source;
        if (source) return source;

        inst = inst.$parent;
      }
    },
    getFile(inst) {
      const ctor = getCtor(inst);
      return ctor.__file || ctor.options?.__file;
    },
    getName(inst) {
      return getCtor(inst).options?.name;
    },
  });

  function getCtor(inst: any) {
    return inst.$vnode.componentOptions.Ctor;
  }
}
