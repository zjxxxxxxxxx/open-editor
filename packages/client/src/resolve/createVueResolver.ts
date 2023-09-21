import { isStr } from '@open-editor/shared';
import { ensureFileName, isValidFileName } from './util';
import { ResolveDebug } from './resolveDebug';
import { ElementSourceMeta } from '.';

interface VueResolverOptions<T = any> {
  isValid(instance: T): boolean;
  isValidNext(instance: T): boolean;
  getNext(instance: T): T | null | undefined;
  getVueSource(instance: T): string;
  getFile(instance: T): string;
  getName(instance: T): string | undefined;
}

export function createVueResolver<T = any>(options: VueResolverOptions<T>) {
  return function vueResolver(
    debug: ResolveDebug<T>,
    tree: Partial<ElementSourceMeta>[],
    deep: boolean,
  ) {
    if (hasVueSource(debug.originalElement)) {
      resolveSourceFromVueSource(debug, tree, deep, options);
    } else {
      resolveSourceFromInstance(debug, tree, deep, options);
    }
  };
}

function resolveSourceFromVueSource<Instance = any>(
  debug: ResolveDebug<Instance>,
  tree: Partial<ElementSourceMeta>[],
  deep: boolean,
  opts: VueResolverOptions,
) {
  let [instance, source] = resolveVueSourceAnchor(debug, opts);

  while (opts.isValid(instance)) {
    if (opts.isValidNext(instance)) {
      const __source = opts.getVueSource(instance);
      const __file = opts.getFile(instance);
      if (isValidVueComponent(__source, __file, source.file)) {
        push(instance);

        if (!deep) return;
        source = parseVueSource(__source);
      }
    } else {
      push(instance);
    }

    instance = opts.getNext(instance);
  }

  function push(instance: Instance) {
    tree.push({
      name: opts.getName(instance) ?? getName(opts.getFile(instance)),
      ...source,
    });
  }
}

function resolveVueSourceAnchor<Instance = any>(
  debug: ResolveDebug,
  opts: Pick<VueResolverOptions<Instance>, 'getVueSource' | 'getNext'>,
) {
  let instance = debug.value;
  let element = debug.originalElement;

  while (element && !getElementVueSource(element)) {
    element = element.parentElement!;
  }

  const __source = getElementVueSource(element);
  if (isStr(__source)) {
    return <const>[instance, parseVueSource(__source)];
  }

  while (instance) {
    const __source = opts.getVueSource(instance);
    if (isStr(__source)) {
      return <const>[opts.getNext(instance), parseVueSource(__source)];
    }

    instance = opts.getNext(instance);
  }

  return [];
}

function resolveSourceFromInstance<Instance = any>(
  debug: ResolveDebug<Instance>,
  tree: Partial<ElementSourceMeta>[],
  deep: boolean,
  opts: VueResolverOptions,
) {
  let instance = debug.value;

  while (opts.isValid(instance)) {
    const file = opts.getFile(instance);
    if (isValidFileName(file)) {
      tree.push({
        name: opts.getName(instance) ?? getName(opts.getFile(instance)),
        file,
      });

      if (!deep) return;
    }

    instance = opts.getNext(instance);
  }
}

function parseVueSource(__source: string) {
  const [file, line, column] = __source.split(':');
  return {
    file: ensureFileName(file),
    line: Number(line),
    column: Number(column),
  };
}

function isValidVueComponent(
  __source: string,
  __file: string,
  sourceFile: string,
) {
  return (
    isStr(__source) && isValidFileName(__file) && __file.endsWith(sourceFile)
  );
}

let hvs: boolean | null = null;
function hasVueSource(element: HTMLElement) {
  if (hvs != null) return hvs;

  while (element) {
    if (getElementVueSource(element) != null) {
      return (hvs = true);
    }

    element = element.parentElement!;
  }

  return (hvs = false);
}

const vueComponentNameRE = /([^/.]+)\.vue$/;
export function getName(file = '') {
  return file.match(vueComponentNameRE)?.[1];
}

function getElementVueSource(element?: HTMLElement) {
  return element?.getAttribute('__source');
}
