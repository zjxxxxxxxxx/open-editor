import { ComponentInternalInstance } from '@vue/runtime-core';

import { getComponentNameByFile, isValidFileName } from '../util';
import { ResolveDebug } from '../resolveDebug';
import { ElementSourceMeta } from '../resolveSource';

export function resolveVue3(
  debug: ResolveDebug<ComponentInternalInstance>,
  tree: Partial<ElementSourceMeta>[],
  deep?: boolean,
) {
  const source = find__source(debug);
  if (source) {
    return resolveSourceFrom__source({ source, ...debug }, tree, deep);
  }
  return resolveSourceFromInstance(debug.value, tree, deep);
}

function resolveSourceFrom__source(
  debug: ResolveDebug<ComponentInternalInstance> & {
    source: ReturnType<typeof parse__source>;
  },
  tree: Partial<ElementSourceMeta>[],
  deep?: boolean,
) {
  let instance = debug.value;
  let source = debug.source;
  while (instance) {
    if (instance.parent == null) {
      tree.push({
        name: getComponentName(instance),
        ...source,
      });
      return;
    } else if (instance.props.__source) {
      const instanceSource = parse__source(instance.props.__source as string);
      if (
        source.file !== instanceSource.file &&
        isValidFileName(instanceSource.file)
      ) {
        tree.push({
          name: getComponentName(instance),
          ...source,
        });
        if (!deep) return;

        source = instanceSource;
      }
    }
    instance = instance.parent;
  }
}

function find__source(debug: ResolveDebug<ComponentInternalInstance>) {
  let instance = debug.value;

  const __source = debug.element.getAttribute('__source');
  if (__source) {
    return parse__source(__source);
  }

  while (instance) {
    if (instance.props.__source) {
      return parse__source(instance.props.__source as string);
    }
    instance = instance.parent;
  }
}

export function parse__source(__source: string) {
  const [file, line, column] = __source.split(':');
  return {
    file,
    line: Number(line),
    column: Number(column),
  };
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

function getComponentName(instance: ComponentInternalInstance) {
  return (
    instance.type.name ??
    instance.type.__name ??
    getComponentNameByFile(instance.type.__file, 'vue')
  );
}
