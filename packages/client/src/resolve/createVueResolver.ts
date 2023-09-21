import { isStr } from '@open-editor/shared';
import type { ResolveDebug } from './resolveDebug';
import type { ElementSourceMeta } from './resolveSource';
import { ensureFileName, isValidFileName } from './util';

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
    if (isVueSource(debug.originalElement)) {
      resolveSourceFromVueSource(debug, tree, deep, options);
    } else {
      resolveSourceFromInstance(debug, tree, deep, options);
    }
  };
}

function resolveSourceFromVueSource<T = any>(
  debug: ResolveDebug<T>,
  tree: Partial<ElementSourceMeta>[],
  deep: boolean,
  options: VueResolverOptions,
) {
  const { isValid, isValidNext, getNext, getVueSource, getFile, getName } =
    options;

  let [instance, source] = resolveVueSourceAnchor(debug, options);

  while (isValid(instance)) {
    if (isValidNext(instance)) {
      const __source = getVueSource(instance);
      const __file = getFile(instance);
      if (
        isStr(__source) &&
        isValidFileName(__file) &&
        __file.endsWith(source.file)
      ) {
        push(instance);

        if (!deep) return;
        source = parseVueSource(__source);
      }
    } else {
      push(instance);
    }

    instance = getNext(instance);
  }

  function push(instance: T) {
    tree.push({
      name: getName(instance) ?? getNameByFile(getFile(instance)),
      ...source,
    });
  }
}

function resolveVueSourceAnchor<T = any>(
  debug: ResolveDebug,
  options: Pick<VueResolverOptions<T>, 'getVueSource' | 'getNext'>,
) {
  const { getVueSource, getNext } = options;

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
    const __source = getVueSource(instance);
    if (isStr(__source)) {
      return <const>[getNext(instance), parseVueSource(__source)];
    }

    instance = getNext(instance);
  }

  return [];
}

function resolveSourceFromInstance<T = any>(
  debug: ResolveDebug<T>,
  tree: Partial<ElementSourceMeta>[],
  deep: boolean,
  options: VueResolverOptions,
) {
  const { isValid, getNext, getFile, getName } = options;

  let instance = debug.value;

  while (isValid(instance)) {
    const __file = getFile(instance);
    if (isValidFileName(__file)) {
      tree.push({
        name: getName(instance) ?? getNameByFile(__file),
        file: __file,
      });

      if (!deep) return;
    }

    instance = getNext(instance);
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

let hasVueSource: boolean | null = null;
function isVueSource(element: HTMLElement) {
  if (hasVueSource != null) return hasVueSource;

  while (element) {
    if (getElementVueSource(element) != null) {
      return (hasVueSource = true);
    }
    element = element.parentElement!;
  }

  return (hasVueSource = false);
}

const vueComponentNameRE = /([^/.]+)\.vue$/;
export function getNameByFile(file = '') {
  return file.match(vueComponentNameRE)?.[1];
}

function getElementVueSource(element?: HTMLElement) {
  return element?.getAttribute('__source');
}
