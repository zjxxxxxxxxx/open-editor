import type { Fiber } from 'react-reconciler';
import type { ComponentInternalInstance } from '@vue/runtime-core';
import { getOptions } from '../options';
import { resolveDebug } from './resolveDebug';

export interface ElementSource {
  element: string;
  component?: string;
  file?: string;
  line?: number;
  column?: number;
}

export function resolveSource(element: HTMLElement): ElementSource {
  const source: ElementSource = {
    element: element.localName,
  };

  const debug = resolveDebug(element);
  if (!debug) {
    return source;
  }

  let debugSource: Omit<ElementSource, 'element'> | undefined;
  if (debug.key.startsWith('__react')) {
    debugSource = resolveSourceFromReact(debug.value);
  } else if (debug.key.startsWith('__vue')) {
    debugSource = resolveSourceFromVue(debug.value);
  } else if (debug.key.startsWith('__svelte')) {
    debugSource = resolveSourceFromSvelte(debug.value);
  }
  if (!debugSource) {
    return source;
  }

  return {
    ...source,
    ...debugSource,
    component: debugSource.file
      ? debugSource.component ?? 'Anonymous'
      : undefined,
    file: debugSource.file ? ensureFileName(debugSource.file) : undefined,
  };
}

function resolveSourceFromReact(fiber?: Fiber | null) {
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

function resolveSourceFromVue(instance?: ComponentInternalInstance | null) {
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

function resolveSourceFromSvelte(meta?: { loc: { file?: string } } | null) {
  if (!meta) return;

  return {
    component: matchComponent(meta.loc.file, 'svelte'),
    file: meta.loc.file,
  };
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
