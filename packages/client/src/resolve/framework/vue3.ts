import type { ComponentInternalInstance } from '@vue/runtime-core';
import type { ResolveDebug } from '../resolveDebug';
import type { ElementSourceMeta } from '../resolveSource';
import { createVueResolver } from '../createVueResolver';

export function resolveVue3(
  debug: ResolveDebug,
  tree: Partial<ElementSourceMeta>[],
  deep = false,
) {
  getResolver()(debug, tree, deep);
}

let resolver: ReturnType<typeof createVueResolver<ComponentInternalInstance>>;
function getResolver() {
  return (resolver ||= createVueResolver({
    isValid(inst) {
      return Boolean(inst);
    },
    isValidNext(inst) {
      return Boolean(inst.parent);
    },
    getNext(inst) {
      return inst.parent;
    },
    getSource(inst) {
      return <string>inst.props.__source;
    },
    getFile(inst) {
      return <string>inst.type.__file;
    },
    getName(inst) {
      return inst.type.name || inst.type.__name;
    },
  }));
}
