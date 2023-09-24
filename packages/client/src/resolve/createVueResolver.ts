import { isBol, isStr } from '@open-editor/shared';
import type { ResolveDebug } from './resolveDebug';
import type { ElementSourceMeta } from './resolveSource';
import { ensureFileName, isValidFileName } from './util';

interface VueResolverOptions<T = any> {
  isValid(instance: T): boolean;
  isValidNext(instance: T): boolean;
  getNext(instance: T): T | null | undefined;
  getSource(instance: T): string | undefined;
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
  const { isValid, isValidNext, getNext, getSource, getFile, getName } =
    options;

  let [instance, source] = resolveVueSourceAnchor(debug, options);

  while (isValid(instance)) {
    if (isValidNext(instance)) {
      const __source = getSource(instance);
      const __file = getFile(instance);
      if (
        isStr(__source) &&
        isValidFileName(__file) &&
        ensureFileName(__file) === source.file
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
  options: Pick<VueResolverOptions<T>, 'isValidNext' | 'getSource' | 'getNext'>,
) {
  const { isValidNext, getSource, getNext } = options;

  let instance = debug.value;
  let element = debug.originalElement as HTMLElement & Record<string, any>;
  let __source: string | null | undefined;

  // find the first element with __source
  while (element && !isStr((__source = getElementVueSource(element)))) {
    element = element.parentElement!;
  }
  // if the element exists and belongs to the component, the result is returned
  if (element) {
    if (element[debug.key] ? element[debug.key] === instance : true) {
      return <const>[instance, parseVueSource(__source!)];
    }
  }
  // the root component returns the result directly
  if (isStr(__source) && !isValidNext(instance)) {
    return <const>[instance, parseVueSource(__source)];
  }
  // try to get the result from the component
  while (instance) {
    if (isStr((__source = getSource(instance)))) {
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
function isVueSource(element?: HTMLElement | null) {
  if (isBol(cacheIsVueSource)) {
    return cacheIsVueSource;
  }

  while (element) {
    if (isStr(getElementVueSource(element))) {
      return (cacheIsVueSource = true);
    }
    element = element.parentElement;
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
