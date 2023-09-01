import type { Fiber } from 'react-reconciler';
import type { ComponentInternalInstance } from '@vue/runtime-core';
import { isFunc } from '@open-editor/shared';

import { getOptions } from '../options';

import { resolveDebug } from './resolveDebug';

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
  if (debug.key.startsWith('__react')) {
    tree = resolveSourceFromReact(debug.value, deep);
  } else if (debug.key.startsWith('__vueParent')) {
    tree = resolveSourceFromVue(debug.value, deep);
  } else if (debug.key.startsWith('__vue')) {
    tree = resolveSourceFromVue2(debug.value, deep);
  } else if (debug.key.startsWith('__svelte')) {
    tree = resolveSourceFromSvelte(debug.value);
  } else if (debug.key.startsWith('_qc')) {
    tree = resolveSourceFromQwik(debug.value, deep);
  }

  source.tree = tree.map(normalizeMeta);
  source.meta = source.tree[0];

  return source;
}

function resolveSourceFromReact(fiber?: Fiber | null, deep?: boolean) {
  const tree: Partial<ElementSourceMeta>[] = [];

  while (fiber) {
    let owner = fiber._debugOwner;

    const source = fiber._debugSource;
    if (source) {
      while (!isReactComponent(owner)) {
        if (!owner) {
          return tree;
        }
        owner = owner._debugOwner;
      }

      tree.push({
        name: getReactComponentName(owner as Fiber),
        file: source.fileName,
        line: source.lineNumber,
        column: (<any>source).columnNumber,
      });

      if (!deep) {
        return tree;
      }
    }

    fiber = owner;
  }

  return tree;
}

function resolveSourceFromVue(
  instance?: ComponentInternalInstance | null,
  deep?: boolean,
) {
  const tree: Partial<ElementSourceMeta>[] = [];

  while (instance) {
    if (isValidFileName(instance.type.__file)) {
      tree.push({
        name:
          instance.type.name ??
          instance.type.__name ??
          getComponentNameByFile(instance.type.__file, 'vue'),
        file: instance.type.__file,
      });

      if (!deep) {
        return tree;
      }
    }

    instance = instance.parent;
  }

  return tree;
}

function resolveSourceFromVue2(instance?: any | null, deep?: boolean) {
  const tree: Partial<ElementSourceMeta>[] = [];

  if (!instance.$vnode) {
    instance = instance._vnode.componentInstance;
  }

  while (instance) {
    const { options } = instance.$vnode.componentOptions.Ctor;
    if (isValidFileName(options.__file)) {
      tree.push({
        name: options.name ?? getComponentNameByFile(options.__file, 'vue'),
        file: options.__file,
      });

      if (!deep) {
        return tree;
      }
    }

    instance = instance.$parent;
  }

  return tree;
}

function resolveSourceFromSvelte(meta?: { loc: { file?: string } } | null) {
  if (!meta) return [];

  return [
    {
      name: getComponentNameByFile(meta.loc.file, 'svelte'),
      file: meta.loc.file,
    },
  ];
}

const qwikPosRE = /:(\d+):(\d+)$/;
function resolveSourceFromQwik(debug?: any | null, deep?: boolean) {
  const tree: Partial<ElementSourceMeta>[] = [];

  let { $element$, $parent$ } = debug;
  while ($parent$) {
    if ($parent$.$componentQrl$) {
      const { displayName, file } = $parent$.$componentQrl$.dev;
      const [, line, column] =
        $element$?.getAttribute('data-qwik-inspector')?.match(qwikPosRE) ?? [];

      tree.push({
        name: displayName.replace(/_component$/, ''),
        file,
        line,
        column,
      });

      if (!deep) {
        return tree;
      }
    }

    $element$ = $parent$.$element$;
    $parent$ = $parent$.$parent$;
  }

  return tree;
}

function normalizeMeta(meta: Partial<ElementSourceMeta>) {
  return {
    name: meta.name || 'Anonymous',
    file: ensureFileName(meta.file!),
    line: meta.line || 1,
    column: meta.column || 1,
  };
}

function ensureFileName(fileName: string) {
  const { rootDir } = getOptions();
  if (fileName.startsWith(rootDir)) {
    fileName = fileName.replace(rootDir, '');
  }
  return `/${fileName.replace(/^\//, '')}`;
}

function getComponentNameByFile(file = '', suffix = '') {
  if (file.endsWith(`.${suffix}`)) {
    const matchRE = new RegExp(`([^/.]+).${suffix}$`);
    return file.match(matchRE)?.[1];
  }
}

function isValidFileName(fileName?: string) {
  if (fileName) {
    return !fileName.startsWith('/home/runner/');
  }
  return false;
}

function isReactComponent(owner?: Fiber | null) {
  if (owner && owner._debugSource) {
    return isFunc(owner.type) || isFunc(owner.type.render);
  }
  return false;
}

function getReactComponentName(owner: Fiber) {
  const component = isFunc(owner.type)
    ? owner.type
    : // React.forwardRef(Component)
      owner.type.render;
  return component?.name || component?.displayName;
}
