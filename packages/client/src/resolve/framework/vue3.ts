import type { ComponentInternalInstance } from '@vue/runtime-core';
import type { ResolveDebug } from '../resolveDebug';
import type { ElementSourceMeta } from '../resolveSource';
import { createVueResolver } from '../createVueResolver';

let resolver: ReturnType<typeof createVueResolver<ComponentInternalInstance>>;
function createResolver() {
  resolver = createVueResolver({
    isValid: (instance) => Boolean(instance),
    isValidNext: (instance) => Boolean(instance.parent),
    getNext: (instance) => instance.parent,
    getVueSource: (instance) => <string>instance.props.__source,
    getFile: (instance) => <string>instance.props.__file,
    getName: (instance) => instance.type.name ?? instance.type.__name,
  });
}

export function resolveVue3(
  debug: ResolveDebug,
  tree: Partial<ElementSourceMeta>[],
  deep = false,
) {
  if (!resolver) createResolver();
  resolver(debug, tree, deep);
}
