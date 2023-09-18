import { getComponentNameByFile, isValidFileName } from '../util';
import { ResolveDebug } from '../resolveDebug';
import { ElementSourceMeta } from '../resolveSource';
import { parse__source } from './vue3';

export function resolveVue2(
  debug: ResolveDebug,
  tree: Partial<ElementSourceMeta>[],
  deep?: boolean,
) {
  if (debug.value._vnode.componentInstance) {
    debug.value = debug.value._vnode.componentInstance;
  }

  const source = find__source(debug);
  if (source) {
    return resolveSourceFrom__source({ source, ...debug }, tree, deep);
  }
  return resolveSourceFromInstance(debug.value, tree, deep);
}

function resolveSourceFrom__source(
  debug: ResolveDebug & {
    source: ReturnType<typeof parse__source>;
  },
  tree: Partial<ElementSourceMeta>[],
  deep?: boolean,
) {
  let instance = debug.value;
  let source = debug.source;
  console.log(source);
  while (instance) {
    if (instance.$parent == null) {
      tree.push({
        name: getComponentName(instance),
        ...source,
      });
      return;
    } else if (get__source(instance)) {
      const instanceSource = parse__source(get__source(instance));
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
    instance = instance.$parent;
  }
}

function find__source(debug: ResolveDebug) {
  let element = debug.originalElement;
  while (element && !element.getAttribute('__source')) {
    element = element.parentElement!;
  }
  if (element?.getAttribute('__source')) {
    return parse__source(element.getAttribute('__source')!);
  }

  let instance = debug.value;
  while (instance) {
    if (get__source(instance)) {
      return parse__source(get__source(instance));
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
    const { Ctor } = instance.$vnode.componentOptions;
    const __file = Ctor?.__file ?? Ctor.options?.__file;
    if (isValidFileName(__file)) {
      tree.push({
        name: getComponentName(Ctor),
        file: __file,
      });

      if (!deep) return;
    }

    instance = instance.$parent;
  }
}

function get__source(instance: any) {
  return instance.componentInstance?.$props?.__source;
}

function getComponentName(Ctor: any) {
  const __file = Ctor?.__file ?? Ctor.options?.__file;
  return Ctor.options?.name ?? getComponentNameByFile(__file, 'vue');
}
