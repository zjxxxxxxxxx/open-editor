import type { ComponentInternalInstance } from '@vue/runtime-core';
import type { ResolveDebug } from '../resolveDebug';
import type { ElementSourceMeta } from '../resolveSource';
import { createVueResolver } from '../createVueResolver';

let resolver: ReturnType<typeof createVueResolver<ComponentInternalInstance>>;
function getResolver() {
  return (resolver ||= createVueResolver({
    isValid(instance) {
      return Boolean(instance);
    },
    isValidNext(instance) {
      return Boolean(instance.parent);
    },
    getNext(instance) {
      return instance.parent;
    },
    getSource(instance) {
      return <string>instance.props.__source;
    },
    getFile(instance) {
      return <string>instance.type.__file;
    },
    getName(instance) {
      return instance.type.name || instance.type.__name;
    },
  }));
}

export function resolveVue3(
  debug: ResolveDebug,
  tree: Partial<ElementSourceMeta>[],
  deep = false,
) {
  getResolver()(debug, tree, deep);
}
