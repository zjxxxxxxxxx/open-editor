import { ComponentInternalInstance } from '@vue/runtime-core';

import { getComponentNameByFile, isValidFileName } from '../util';
import { ElementSourceMeta } from '../resolveSource';

export function resolveSourceFromVue(
  instance?: ComponentInternalInstance | null,
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

export function resolveSourceFromVue2(instance?: any | null, deep?: boolean) {
  const tree: Partial<ElementSourceMeta>[] = [];

  if (!instance.$vnode) {
    instance = instance._vnode.componentInstance;
  }

  while (instance) {
    const { options } = instance.$vnode.componentOptions.Ctor;
    if (isValidFileName(options.__file)) {
      tree.push({
        name: options.name ?? getComponentNameByFile(options.__file, 'vue'),
        file: options.__file,
      });

      if (!deep) {
        return tree;
      }
    }

    instance = instance.$parent;
  }

  return tree;
}
