import { isStr } from '@open-editor/shared';

import type { ResolveDebug } from '../resolveDebug';
import type { ElementSourceMeta } from '../resolveSource';
import {
  getElementVueSource,
  getVueComponentName,
  hasVueSource,
  isValidFileName,
  parseVueSource,
} from '../util';

export function resolveVue2(
  debug: ResolveDebug,
  tree: Partial<ElementSourceMeta>[],
  deep?: boolean,
) {
  if (debug.value._vnode.componentInstance) {
    debug.value = debug.value._vnode.componentInstance;
  }

  if (hasVueSource(debug.element)) {
    return resolveSourceFromVueSource(debug, tree, deep);
  }
  return resolveSourceFromInstance(debug.value, tree, deep);
}

function resolveSourceFromVueSource(
  debug: ResolveDebug,
  tree: Partial<ElementSourceMeta>[],
  deep?: boolean,
) {
  let [instance, source] = resolveVueSourceAnchor(debug);

  while (instance && instance.$vnode) {
    if (instance.$parent.$vnode == null) {
      tree.push({
        name: getComponentName(instance),
        ...source,
      });
    } else if (isStr(getComponentVueSource(instance))) {
      if (isValidFileName(getComponentFile(instance))) {
        tree.push({
          name: getComponentName(instance),
          ...source,
        });
        if (!deep) return;

        source = parseVueSource(getComponentVueSource(instance));
      }
    }

    instance = instance.$parent;
  }
}

function resolveSourceFromInstance(
  instance: any | null | undefined,
  tree: Partial<ElementSourceMeta>[],
  deep?: boolean,
) {
  while (instance && instance.$vnode) {
    const file = getComponentFile(instance);
    if (isValidFileName(file)) {
      tree.push({
        name: getComponentName(instance),
        file,
      });

      if (!deep) return;
    }

    instance = instance.$parent;
  }
}

function resolveVueSourceAnchor(debug: ResolveDebug) {
  let instance = debug.value;
  let element = debug.originalElement;

  while (element && !getElementVueSource(element)) {
    element = element.parentElement!;
  }

  const __source = getElementVueSource(element);
  if (isStr(__source)) {
    return <const>[instance, parseVueSource(__source)];
  }

  while (instance) {
    const __source = getComponentVueSource(instance);
    if (isStr(__source)) {
      return <const>[instance.$parent, parseVueSource(__source)];
    }

    instance = instance.$parent;
  }

  return [];
}

function getComponentVueSource(instance: any) {
  return instance.$vnode.componentInstance.$props.__source;
}

function getComponentName(instance: any) {
  const { Ctor } = instance.$vnode.componentOptions;
  const file = getComponentFile(instance);
  return Ctor.options?.name ?? getVueComponentName(file);
}

function getComponentFile(instance: any) {
  const { Ctor } = instance.$vnode.componentOptions;
  return Ctor?.__file ?? Ctor.options?.__file;
}
