import type { Fiber } from 'react-reconciler';
import type { ComponentInternalInstance } from '@vue/runtime-core';

export function resolveFilename(element: HTMLElement) {
  const resolvedKey = resolveKey(element);
  if (!resolvedKey) return;

  let filename: string | undefined;
  if (resolvedKey === '__vueParentComponent') {
    filename = resolveFilenameFromVue(element[resolvedKey]);
  } else {
    filename = resolveFilenameFromReact(element[resolvedKey]);
  }

  if (!filename) {
    throw Error('@open-editor/client: filename not found');
  }

  return filename;
}

function resolveKey(element: HTMLElement) {
  if ('__vueParentComponent' in element) {
    return '__vueParentComponent';
  } else {
    return Object.keys(element).find((key) => key.startsWith('__reactFiber$'));
  }
}

function resolveFilenameFromVue(instance: ComponentInternalInstance) {
  while (!instance.type?.__file) {
    instance = instance.parent;
  }
  return instance?.type?.__file;
}

function resolveFilenameFromReact(fiber: Fiber) {
  while (!fiber._debugSource) {
    fiber = fiber._debugOwner;
  }
  return fiber?._debugSource?.fileName;
}
