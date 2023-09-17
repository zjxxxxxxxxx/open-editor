import { resolveDebug } from './resolveDebug';
import { ensureFileName } from './util';
import {
  resolveSourceFromReact,
  resolveSourceFromReact15,
} from './framework/react';
import { resolveSourceFromVue, resolveSourceFromVue2 } from './framework/vue';

export interface ElementSourceMeta {
  name: string;
  file: string;
  line: number;
  column: number;
}
export interface ElementSource {
  element: string;
  meta?: ElementSourceMeta;
  tree: ElementSourceMeta[];
}

export function resolveSource(
  element: HTMLElement,
  deep?: boolean,
): ElementSource {
  const source: ElementSource = {
    element: element.localName,
    tree: [],
  };

  const debug = resolveDebug(element);
  if (!debug) {
    return source;
  }

  let tree: Partial<ElementSourceMeta>[] = [];
  if (debug.key.startsWith('__reactFiber')) {
    tree = resolveSourceFromReact(debug, deep);
  } else if (debug.key.startsWith('__reactInternal')) {
    tree = resolveSourceFromReact15(debug, deep);
  } else if (debug.key.startsWith('__vueParent')) {
    tree = resolveSourceFromVue(debug, deep);
  } else if (debug.key.startsWith('__vue')) {
    tree = resolveSourceFromVue2(debug, deep);
  }

  source.tree = tree.map(normalizeMeta);
  source.meta = source.tree[0];

  return source;
}

export function normalizeMeta(meta: Partial<ElementSourceMeta>) {
  return {
    name: meta.name || 'Anonymous',
    file: ensureFileName(meta.file!),
    line: meta.line || 1,
    column: meta.column || 1,
  };
}
