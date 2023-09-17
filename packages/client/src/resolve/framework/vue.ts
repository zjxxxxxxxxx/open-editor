import { ComponentInternalInstance } from '@vue/runtime-core';

import { getComponentNameByFile, isValidFileName } from '../util';
import { ResolveDebug } from '../resolveDebug';
import { ElementSourceMeta } from '../resolveSource';

export function resolveSourceFromVue(
  { value: instance }: ResolveDebug<ComponentInternalInstance>,
  deep?: boolean,
) {
  const tree: Partial<ElementSourceMeta>[] = [];

  while (instance) {
    if (isValidFileName(instance.type.__file)) {
      tree.push({
        name:
          instance.type.name ??
          instance.type.__name ??
          getComponentNameByFile(instance.type.__file, 'vue'),
        file: instance.type.__file,
      });

      if (!deep) {
        return tree;
      }
    }

    instance = instance.parent;
  }

  return tree;
}

export function resolveSourceFromVue2(
  { value: instance }: ResolveDebug,
  deep?: boolean,
) {
  const tree: Partial<ElementSourceMeta>[] = [];

  if (instance._vnode.componentInstance) {
    instance = instance._vnode.componentInstance;
  }

  while (instance && instance.$vnode) {
    const { Ctor } = instance.$vnode.componentOptions;
    const __file = Ctor?.__file ?? Ctor.options?.__file;
    if (isValidFileName(__file)) {
      tree.push({
        name: Ctor.options?.name ?? getComponentNameByFile(__file, 'vue'),
        file: __file,
      });

      if (!deep) {
        return tree;
      }
    }

    instance = instance.$parent;
  }

  return tree;
}
