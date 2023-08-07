import type { Fiber } from 'react-reconciler';
import type { ComponentInternalInstance } from '@vue/runtime-core';
import { getOptions } from '../options';

export interface ElementSource {
  element: string;
  component?: string;
  file?: string;
  line?: number;
  column?: number;
}

export function resolveSource(element: HTMLElement): ElementSource {
  let source: Partial<ElementSource> = {};

  const resolvedKey = resolveKey(element);
  if (resolvedKey) {
    if (resolvedKey === '__vueParentComponent') {
      source = resolveSourceFromVue((<any>element)[resolvedKey]);
    } else if (resolvedKey === '__svelte_meta') {
      source = resolveSourceFromSvelte((<any>element)[resolvedKey]);
    } else {
      source = resolveSourceFromReact((<any>element)[resolvedKey]);
    }
  }

  return {
    ...source,
    element: element.localName,
    component: source.file ? source.component ?? 'Anonymous' : undefined,
    file: source.file ? ensureFileName(source.file) : undefined,
  };
}

function resolveKey(element: HTMLElement) {
  let key = Object.keys(element).find(
    (key) =>
      // React17+
      key.startsWith('__reactFiber') ||
      // React15+
      key.startsWith('__reactInternalInstance') ||
      key === '__svelte_meta',
  );

  if (!key) {
    if ('__vueParentComponent' in element) {
      key = '__vueParentComponent';
    }
  }

  return key;
}

function resolveSourceFromVue(instance?: ComponentInternalInstance | null) {
  while (instance && !instance.type?.__file) {
    instance = instance.parent;
  }

  return {
    component: instance?.type?.__name,
    file: instance?.type?.__file,
  };
}

function resolveSourceFromSvelte(meta: any) {
  return {
    component: meta?.loc.file?.match(/([^/.]+).svelte$/)![1],
    file: meta?.loc.file,
  };
}

function resolveSourceFromReact(fiber?: Fiber | null) {
  while (fiber && !fiber._debugSource) {
    fiber = fiber._debugOwner;
  }
  if (!fiber) return {};

  const source = fiber._debugSource;

  let owner = fiber._debugOwner;
  while (owner && (typeof owner.type !== 'function' || !owner._debugSource)) {
    owner = owner._debugOwner;
  }

  return {
    component: owner?.type.name ?? owner?.type.displayName,
    file: source?.fileName,
    line: source?.lineNumber,
    column: (<any>source)?.columnNumber,
  };
}

function ensureFileName(fileName: string) {
  const { rootDir } = getOptions();
  if (fileName.startsWith(rootDir)) {
    return fileName.replace(rootDir, '');
  }

  return `/${fileName.replace(/^\//, '')}`;
}
