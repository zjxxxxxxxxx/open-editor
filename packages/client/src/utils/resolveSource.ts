import type { Fiber } from 'react-reconciler';
import type { ComponentInternalInstance } from '@vue/runtime-core';
import { getOptions } from '../options';

export interface ElementSource {
  element: string;
  component?: string;
  file?: string;
}

export function resolveSource(element: HTMLElement): ElementSource {
  let source: Partial<ElementSource> = {};

  const resolvedKey = resolveKey(element);
  if (resolvedKey) {
    if (resolvedKey === '__vueParentComponent') {
      source = resolveSourceFromVue((element as any)[resolvedKey]);
    } else if (resolvedKey === '__svelte_meta') {
      source = resolveSourceFromSvelte((element as any)[resolvedKey]);
    } else {
      source = resolveSourceFromReact((element as any)[resolvedKey]);
    }
  }

  return {
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

function resolveSourceFromVue(instance: ComponentInternalInstance | null) {
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

function resolveSourceFromReact(fiber: Fiber | null | undefined) {
  while (fiber && !fiber._debugSource) {
    fiber = fiber._debugOwner;
  }
  if (!fiber) return {};

  const file = fiber._debugSource?.fileName;

  let owner = fiber._debugOwner;
  while (owner && typeof fiber.type !== 'function' && owner._debugSource) {
    owner = owner._debugOwner;
  }
  if (!owner) return { file };

  const component = owner.type.name ?? owner.type.displayName;
  return {
    component,
    file,
  };
}

function ensureFileName(fileName: string) {
  const { rootDir } = getOptions();
  if (fileName.startsWith(rootDir)) {
    return fileName.replace(rootDir, '');
  }

  return `/${fileName.replace(/^\//, '')}`;
}
