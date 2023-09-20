import type { ComponentInternalInstance } from '@vue/runtime-core';
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

export function resolveVue3(
  debug: ResolveDebug<ComponentInternalInstance>,
  tree: Partial<ElementSourceMeta>[],
  deep?: boolean,
) {
  if (hasVueSource(debug.originalElement)) {
    return resolveSourceFromVueSource(debug, tree, deep);
  }
  return resolveSourceFromInstance(debug.value, tree, deep);
}

function resolveSourceFromVueSource(
  debug: ResolveDebug<ComponentInternalInstance>,
  tree: Partial<ElementSourceMeta>[],
  deep?: boolean,
) {
  let [instance, source] = resolveVueSourceAnchor(debug);

  while (instance) {
    if (instance.parent == null) {
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

    instance = instance.parent;
  }
}

function resolveSourceFromInstance(
  instance: ComponentInternalInstance | null | undefined,
  tree: Partial<ElementSourceMeta>[],
  deep?: boolean,
) {
  while (instance) {
    const file = getComponentFile(instance);
    if (isValidFileName(file)) {
      tree.push({
        name: getComponentName(instance),
        file,
      });
      if (!deep) return;
    }

    instance = instance.parent;
  }
}

function resolveVueSourceAnchor(
  debug: ResolveDebug<ComponentInternalInstance>,
) {
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
      return <const>[instance.parent, parseVueSource(__source)];
    }

    instance = instance.parent;
  }

  return [];
}

function getComponentVueSource(instance: ComponentInternalInstance) {
  return instance.props.__source as string;
}

function getComponentFile(instance: ComponentInternalInstance) {
  return instance.type.__file;
}

function getComponentName(instance: ComponentInternalInstance) {
  return (
    instance.type.name ??
    instance.type.__name ??
    getVueComponentName(getComponentFile(instance))
  );
}
