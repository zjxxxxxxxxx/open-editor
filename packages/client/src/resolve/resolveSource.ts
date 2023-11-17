import { ensureFileName } from './util';
import { resolveDebug } from './resolveDebug';
import { resolveReact17Plus } from './framework/react17+';
import { resolveReact15Plus } from './framework/react15+';
import { resolveVue3 } from './framework/vue3';
import { resolveVue2 } from './framework/vue2';

export interface ElementSourceMeta {
  name: string;
  file: string;
  line: number;
  column: number;
}
export interface ElementSource {
  el: string;
  meta?: ElementSourceMeta;
  tree: ElementSourceMeta[];
}

export function resolveSource(el: HTMLElement, deep?: boolean): ElementSource {
  const source: ElementSource = {
    el: el.localName,
    tree: [],
  };

  const debug = resolveDebug(el);
  if (debug) {
    if (debug.key.startsWith('__reactFiber')) {
      resolveReact17Plus(debug, source.tree, deep);
    } else if (debug.key.startsWith('__reactInternal')) {
      resolveReact15Plus(debug, source.tree, deep);
    } else if (debug.key.startsWith('__vueParent')) {
      resolveVue3(debug, source.tree, deep);
    } else if (debug.key.startsWith('__vue')) {
      resolveVue2(debug, source.tree, deep);
    }
  }

  source.tree = source.tree.map(normalizeMeta);
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
