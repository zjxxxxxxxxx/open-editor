import type { ComponentInternalInstance } from '@vue/runtime-core';
import { isStr } from '@open-editor/shared';

import {
  getVueComponentName,
  hasVueSource,
  isValidFileName,
  parseVueSource,
} from '../util';
import { ResolveDebug } from '../resolveDebug';
import { ElementSourceMeta } from '../resolveSource';

export function resolveVue3(
  debug: ResolveDebug<ComponentInternalInstance>,
  tree: Partial<ElementSourceMeta>[],
  deep?: boolean,
) {
  if (hasVueSource(debug.element)) {
    return resolveSourceFromVueSource(debug, tree, deep);
  }
  return resolveSourceFromInstance(debug.value, tree, deep);
}

function resolveSourceFromVueSource(
  debug: ResolveDebug<ComponentInternalInstance>,
  tree: Partial<ElementSourceMeta>[],
  deep?: boolean,
) {
  let [instance, source] = resolveVueSourceStart(debug);

  while (instance) {
    if (instance.parent == null) {
      tree.push({
        name: getComponentName(instance),
        ...source,
      });
    } else if (instance.props.__source) {
      const __source = parseVueSource(instance.props.__source as string);
      if (isValidFileName(__source.file)) {
        tree.push({
          name: getComponentName(instance),
          ...source,
        });
        if (!deep) return;

        source = __source;
      }
    }

    instance = instance.parent;
  }
}

function resolveSourceFromInstance(
  instance: ComponentInternalInstance | null | undefined,
  tree: Partial<ElementSourceMeta>[],
  deep?: boolean,
) {
  while (instance) {
    if (isValidFileName(instance.type.__file)) {
      tree.push({
        name: getComponentName(instance),
        file: instance.type.__file,
      });
      if (!deep) return;
    }

    instance = instance.parent;
  }
}

function resolveVueSourceStart(debug: ResolveDebug<ComponentInternalInstance>) {
  let instance = debug.value;
  let element = debug.element;

  while (element && !element.getAttribute('__source')) {
    element = element.parentElement!;
  }

  const __source = element.getAttribute('__source');
  if (isStr(__source)) {
    return <const>[instance, parseVueSource(__source)];
  }

  while (instance) {
    const __source = instance.props.__source;
    if (isStr(__source)) {
      return <const>[instance.parent, parseVueSource(__source)];
    }

    instance = instance.parent;
  }

  return [];
}

function getComponentName(instance: ComponentInternalInstance) {
  return (
    instance.type.name ??
    instance.type.__name ??
    getVueComponentName(instance.type.__file)
  );
}
