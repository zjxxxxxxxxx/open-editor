import type { Fiber } from 'react-reconciler';
import type { ComponentInternalInstance } from '@vue/runtime-core';
import { getOptions } from '../options';
import { resolveKey } from './resolveKey';

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
    if (resolvedKey.startsWith('__react')) {
      source = resolveSourceFromReact((<any>element)[resolvedKey]);
    } else if (resolvedKey.startsWith('__vue')) {
      source = resolveSourceFromVue((<any>element)[resolvedKey]);
    } else if (resolvedKey.startsWith('__svelte')) {
      source = resolveSourceFromSvelte((<any>element)[resolvedKey]);
    }
  }

  return {
    ...source,
    element: element.localName,
    component: source.file ? source.component ?? 'Anonymous' : undefined,
    file: source.file ? ensureFileName(source.file) : undefined,
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

function resolveSourceFromVue(instance?: ComponentInternalInstance | null) {
  while (instance && !instance.type?.__file) {
    instance = instance.parent;
  }

  return {
    component:
      instance?.type?.__name ??
      instance?.type?.__file?.match(/([^/.]+).vue$/)![1],
    file: instance?.type?.__file,
  };
}

function resolveSourceFromSvelte(meta: any) {
  return {
    component: meta?.loc.file?.match(/([^/.]+).svelte$/)![1],
    file: meta?.loc.file,
  };
}

function ensureFileName(fileName: string) {
  const { rootDir } = getOptions();
  if (fileName.startsWith(rootDir)) {
    return fileName.replace(rootDir, '');
  }

  return `/${fileName.replace(/^\//, '')}`;
}
