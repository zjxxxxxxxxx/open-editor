import { ensureFileName } from './util';
import { resolveDebug } from './resolveDebug';
import { resolveReact18 } from './framework/react18';
import { resolveReact15 } from './framework/react15';
import { resolveVue3 } from './framework/vue3';
import { resolveVue2 } from './framework/vue2';

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

  const tree: Partial<ElementSourceMeta>[] = [];
  if (debug.key.startsWith('__reactFiber')) {
    resolveReact18(debug, tree, deep);
  } else if (debug.key.startsWith('__reactInternal')) {
    resolveReact15(debug, tree, deep);
  } else if (debug.key.startsWith('__vueParent')) {
    resolveVue3(debug, tree, deep);
  } else if (debug.key.startsWith('__vue')) {
    resolveVue2(debug, tree, deep);
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
