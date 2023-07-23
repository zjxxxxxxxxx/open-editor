import type { Fiber } from 'react-reconciler';
import type { ComponentInternalInstance } from '@vue/runtime-core';

export interface ElementSource {
  elementName: string;
  componentName: string;
  fileName: string;
}

export function resolveSource(element: HTMLElement) {
  const elementName = element.localName;

  const resolvedKey = resolveKey(element);
  if (!resolvedKey) {
    console.error(
      `@open-editor/client: no component containing <${elementName}/> was found.`,
    );
    return;
  }

  let source: Omit<ElementSource, 'elementName'> | undefined;
  if (resolvedKey === '__vueParentComponent') {
    source = resolveSourceFromVue(element[resolvedKey]);
  } else {
    source = resolveSourceFromReact(element[resolvedKey]);
  }
  if (!source) {
    console.error(
      `@open-editor/client: no file containing <${elementName}/> was found.`,
    );
    return;
  }

  return source;
}

function resolveKey(element: HTMLElement) {
  if ('__vueParentComponent' in element) {
    return '__vueParentComponent';
  } else {
    return Object.keys(element).find((key) => key.startsWith('__reactFiber$'));
  }
}

function resolveSourceFromVue(instance: ComponentInternalInstance) {
  while (!instance.type?.__file) {
    instance = instance.parent;
  }
  if (!instance) return;

  return {
    componentName: instance.type.__name,
    fileName: ensureFileName(instance.type.__file),
  };
}

function resolveSourceFromReact(fiber: Fiber) {
  while (!fiber._debugSource) {
    fiber = fiber._debugOwner;
  }
  if (!fiber) return;

  return {
    componentName: fiber._debugOwner.type.name,
    fileName: ensureFileName(fiber._debugSource.fileName),
  };
}

function ensureFileName(fileName: string) {
  return `/${fileName.replace(/^\//, '')}`;
}
