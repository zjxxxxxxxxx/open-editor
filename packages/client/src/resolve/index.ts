import { camelCase } from '@open-editor/shared';
import { CURRENT_INSPECT_ID } from '../constants';
import { resolveReact17 } from './resolveReact17';
import { resolveReact15 } from './resolveReact15';
import { resolveVue3 } from './resolveVue3';
import { resolveVue2 } from './resolveVue2';
import { resolveDebug } from './resolveDebug';

export interface CodeSourceMeta {
  name: string;
  file: string;
  line: number;
  column: number;
}

export interface CodeSource {
  id: string;
  el: string;
  meta?: CodeSourceMeta;
  tree: CodeSourceMeta[];
}

export function resolveSource(el: HTMLElement, deep?: boolean): CodeSource {
  const source: CodeSource = {
    id: CURRENT_INSPECT_ID,
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

export function normalizeMeta(meta: Partial<CodeSourceMeta>) {
  return {
    name: meta.name ? camelCase(meta.name) : 'Anonymous',
    file: meta.file!,
    line: meta.line || 1,
    column: meta.column || 1,
  };
}
