import { isStr } from '@open-editor/shared';

import {
  getVueComponentName,
  hasVueSource,
  isValidFileName,
  parseVueSource,
} from '../util';
import { ResolveDebug } from '../resolveDebug';
import { ElementSourceMeta } from '../resolveSource';

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
  let [instance, source] = resolveVueSourceStart(debug);

  while (instance && instance.$vnode) {
    if (instance.$parent.$vnode == null) {
      tree.push({
        name: getComponentName(instance),
        ...source,
      });
    } else if (getVueSource(instance)) {
      const __source = parseVueSource(getVueSource(instance));
      if (isValidFileName(__source.file)) {
        tree.push({
          name: getComponentName(instance),
          ...source,
        });
        if (!deep) return;

        source = __source;
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

function resolveVueSourceStart(debug: ResolveDebug) {
  let instance = debug.value;
  let element = debug.originalElement;

  while (element && !element.getAttribute('__source')) {
    element = element.parentElement!;
  }

  const __source = element.getAttribute('__source');
  if (isStr(__source)) {
    return <const>[instance, parseVueSource(__source)];
  }

  while (instance) {
    const __source = getVueSource(instance);
    if (isStr(__source)) {
      return <const>[instance, parseVueSource(__source)];
    }

    instance = instance.$parent;
  }

  return [];
}

function getVueSource(instance: any) {
  return instance.$vnode.componentInstance?.$props?.__source;
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
