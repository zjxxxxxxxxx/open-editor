import { upperCase } from '../utils/util';
import { ensureFileName } from './util';
import { resolveDebug } from './resolveDebug';
import { resolveReact17Plus } from './resolves/react17+';
import { resolveReact15Plus } from './resolves/react15+';
import { resolveVue3 } from './resolves/vue3';
import { resolveVue2 } from './resolves/vue2';

export interface SourceCodeMeta {
  name: string;
  file: string;
  line: number;
  column: number;
}
export interface SourceCode {
  el: string;
  meta?: SourceCodeMeta;
  tree: SourceCodeMeta[];
}

export function resolveSource(el: HTMLElement, deep?: boolean): SourceCode {
  const source: SourceCode = {
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

export function normalizeMeta(meta: Partial<SourceCodeMeta>) {
  return {
    name: meta.name ? upperCase(meta.name, true) : 'Anonymous',
    file: ensureFileName(meta.file!),
    line: meta.line || 1,
    column: meta.column || 1,
  };
}
