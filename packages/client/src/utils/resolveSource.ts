import type { Fiber } from 'react-reconciler';
import type { ComponentInternalInstance } from '@vue/runtime-core';
import { getOptions } from '../options';
import { resolveDebugKey } from './resolveDebugKey';
import { isValidElement } from './element';

export interface ElementSource {
  element: string;
  component?: string;
  file?: string;
  line?: number;
  column?: number;
}

export function resolveSource(element: HTMLElement): ElementSource {
  let source: Partial<ElementSource> | undefined;

  const debugKey = resolveDebugKey(element);
  if (debugKey) {
    if (debugKey.startsWith('__react')) {
      source = resolveSourceFromReact(element, debugKey);
    } else if (debugKey.startsWith('__vue')) {
      source = resolveSourceFromVue(element, debugKey);
    } else if (debugKey.startsWith('__svelte')) {
      source = resolveSourceFromSvelte(element, debugKey);
    }
  }

  if (!source) {
    return {
      element: element.localName,
    };
  }

  return {
    ...source,
    element: element.localName,
    component: source.file ? source.component ?? 'Anonymous' : undefined,
    file: source.file ? ensureFileName(source.file) : undefined,
  };
}

function resolveSourceFromReact(element: HTMLElement, debugKey: string) {
  let fiber = findDebugValue<Fiber>(element, debugKey);
  while (fiber && !fiber._debugSource) {
    fiber = fiber._debugOwner;
  }
  if (!fiber) return;

  const source = fiber._debugSource!;
  let owner = fiber._debugOwner;
  while (owner && (typeof owner.type !== 'function' || !owner._debugSource)) {
    owner = owner._debugOwner;
  }

  return {
    component: owner?.type.name ?? owner?.type.displayName,
    file: source.fileName,
    line: source.lineNumber,
    column: (<any>source).columnNumber,
  };
}

function resolveSourceFromVue(element: HTMLElement, debugKey: string) {
  let instance = findDebugValue<ComponentInternalInstance>(element, debugKey);
  while (instance && !instance.type.__file) {
    instance = instance.parent;
  }
  if (!instance) return;

  return {
    component:
      instance.type.__name ?? matchComponent(instance.type.__file, 'vue'),
    file: instance.type.__file,
  };
}

function resolveSourceFromSvelte(element: HTMLElement, debugKey: string) {
  const meta = findDebugValue<{ loc: { file?: string } }>(element, debugKey);
  if (!meta) return;

  return {
    component: matchComponent(meta.loc.file, 'svelte'),
    file: meta.loc.file,
  };
}

function findDebugValue<T>(element: HTMLElement, debugKey: string) {
  let debugValue: T | null | undefined;
  while (!debugValue && isValidElement(element)) {
    debugValue = (<any>element)[debugKey];
    if (!debugValue) {
      element = element.parentElement!;
    }
  }
  return debugValue;
}

function matchComponent(file = '', suffix = '') {
  if (file.endsWith(`.${suffix}`)) {
    const matchRE = new RegExp(`([^/.]+).${suffix}$`);
    return file.match(matchRE)?.[1];
  }
}

function ensureFileName(fileName: string) {
  const { rootDir } = getOptions();
  if (fileName.startsWith(rootDir)) {
    fileName = fileName.replace(rootDir, '');
  }
  return `/${fileName.replace(/^\//, '')}`;
}
