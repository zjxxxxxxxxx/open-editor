import type { ComponentInternalInstance } from '@vue/runtime-core';
import type { SourceCodeMeta } from '../';
import type { ResolveDebug } from '../resolveDebug';
import { createVueResolver } from '../creators/createVueResolver';

let resolver: ReturnType<typeof createVueResolver<ComponentInternalInstance>>;
export function resolveVue3(
  debug: ResolveDebug,
  tree: Partial<SourceCodeMeta>[],
  deep = false,
) {
  setupResolver();
  resolver(debug, tree, deep);
}

function setupResolver() {
  resolver ||= createVueResolver({
    isValid(inst): inst is any {
      return !!inst;
    },
    getNext(inst) {
      return inst.parent;
    },
    getSource(inst) {
      while (inst) {
        const source = <string>inst.props.__source;
        if (source) return source;

        inst = inst.parent!;
      }
    },
    getFile(inst) {
      return <string>inst.type.__file;
    },
    getName(inst) {
      return inst.type.name || inst.type.__name;
    },
  });
}
