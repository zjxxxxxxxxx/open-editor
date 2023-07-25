import type { Fiber } from 'react-reconciler';
import type { ComponentInternalInstance } from '@vue/runtime-core';

export interface ElementSource {
  element: string;
  component: string;
  file?: string;
}

export function resolveSource(element: HTMLElement): ElementSource {
  let source: Partial<ElementSource> = {};

  const resolvedKey = resolveKey(element);
  if (resolvedKey) {
    if (resolvedKey === '__vueParentComponent') {
      source = resolveSourceFromVue((element as any)[resolvedKey]);
    } else {
      source = resolveSourceFromReact((element as any)[resolvedKey]);
    }
  }

  return {
    element: element.localName,
    component: source.file ? source.component ?? 'Anonymous' : 'NotFound',
    file: source.file ? ensureFileName(source.file) : undefined,
  };
}

function resolveKey(element: HTMLElement) {
  if ('__vueParentComponent' in element) {
    return '__vueParentComponent';
  } else {
    return Object.keys(element).find(
      (key) =>
        // React17+
        key.startsWith('__reactFiber') ||
        // React15+
        key.startsWith('__reactInternalInstance'),
    );
  }
}

function resolveSourceFromVue(instance: ComponentInternalInstance | null) {
  while (instance && !instance.type?.__file) {
    instance = instance.parent;
  }

  return {
    component: instance?.type?.__name,
    file: instance?.type?.__file,
  };
}

function resolveSourceFromReact(fiber: Fiber | null | undefined) {
  while (fiber && !fiber._debugSource) {
    fiber = fiber._debugOwner;
  }

  return {
    component: fiber?._debugOwner?.type.name,
    file: fiber?._debugSource?.fileName,
  };
}

function ensureFileName(fileName: string) {
  return `/${fileName.replace(/^\//, '')}`;
}
