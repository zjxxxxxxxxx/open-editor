import type { Fiber } from 'react-reconciler';
import type { ComponentInternalInstance } from '@vue/runtime-core';

export interface ElementSource {
  element: string;
  component: string;
  file: string;
}

export function resolveSource(element: HTMLElement) {
  const resolvedKey = resolveKey(element);
  if (!resolvedKey) {
    console.error(
      `@open-editor/client: no component containing <${element.localName}/> was found.`,
    );
    return;
  }

  let source: Omit<ElementSource, 'element'> | undefined;
  if (resolvedKey === '__vueParentComponent') {
    source = resolveSourceFromVue((element as any)[resolvedKey]);
  } else {
    source = resolveSourceFromReact((element as any)[resolvedKey]);
  }
  if (!source) {
    console.error(
      `@open-editor/client: no file containing <${element.localName}/> was found.`,
    );
    return;
  }

  return {
    element: element.localName,
    ...source,
  };
}

function resolveKey(element: HTMLElement) {
  if ('__vueParentComponent' in element) {
    return '__vueParentComponent';
  } else {
    return Object.keys(element).find((key) => key.startsWith('__reactFiber$'));
  }
}

function resolveSourceFromVue(instance: ComponentInternalInstance | null) {
  while (instance && !instance.type?.__file) {
    instance = instance.parent;
  }
  if (!instance) return;

  return {
    component: instance.type.__name!,
    file: ensureFileName(instance.type.__file!),
  };
}

function resolveSourceFromReact(fiber: Fiber | null | undefined) {
  while (fiber && !fiber._debugSource) {
    fiber = fiber._debugOwner;
  }
  if (!fiber) return;

  return {
    component: fiber._debugOwner!.type.name!,
    file: ensureFileName(fiber._debugSource!.fileName!),
  };
}

function ensureFileName(fileName: string) {
  return `/${fileName.replace(/^\//, '')}`;
}
