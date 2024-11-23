import { type ComponentInternalInstance } from '@vue/runtime-core';
import { type VueResolver, createVueResolver } from './createVueResolver';
import { type ResolveDebug } from './resolveDebug';
import { type CodeSourceMeta } from '.';

let resolver: VueResolver<ComponentInternalInstance>;
export function resolveVue3(debug: ResolveDebug, tree: Partial<CodeSourceMeta>[], deep = false) {
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
