import { camelCase } from '@open-editor/shared';
import { ensureFileName } from './util';
import { resolveDebug } from './resolveDebug';
import { resolveReact17 } from './resolves/react17';
import { resolveReact15 } from './resolves/react15';
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
      resolveReact17(debug, source.tree, deep);
    } else if (debug.key.startsWith('__reactInternal')) {
      resolveReact15(debug, source.tree, deep);
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
    name: meta.name ? camelCase(meta.name) : 'Anonymous',
    file: ensureFileName(meta.file!),
    line: meta.line || 1,
    column: meta.column || 1,
  };
}
