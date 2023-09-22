import { isBol, isStr } from '@open-editor/shared';
import type { ResolveDebug } from './resolveDebug';
import type { ElementSourceMeta } from './resolveSource';
import { ensureFileName, isValidFileName } from './util';

interface VueResolverOptions<T = any> {
  isValid(instance: T): boolean;
  isValidNext(instance: T): boolean;
  getNext(instance: T): T | null | undefined;
  getVueSource(instance: T): string | undefined;
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
      resolveVueSource(debug, tree, deep, options);
    } else {
      resolveVueInstance(debug.value, tree, deep, options);
    }
  };
}

function resolveVueSource<T = any>(
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

function resolveVueInstance<T = any>(
  instance: T,
  tree: Partial<ElementSourceMeta>[],
  deep: boolean,
  options: VueResolverOptions,
) {
  const { isValid, getNext, getFile, getName } = options;

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

let cacheIsVueSource: boolean | undefined;
function isVueSource(element: HTMLElement) {
  if (isBol(cacheIsVueSource)) {
    return cacheIsVueSource;
  }

  while (element) {
    if (getElementVueSource(element) != null) {
      return (cacheIsVueSource = true);
    }
    element = element.parentElement!;
  }

  return (cacheIsVueSource = false);
}

const nameRE = /([^/.]+)\.vue$/;
function getNameByFile(file = '') {
  return file.match(nameRE)?.[1];
}

function getElementVueSource(element?: HTMLElement) {
  return element?.getAttribute('__source');
}
