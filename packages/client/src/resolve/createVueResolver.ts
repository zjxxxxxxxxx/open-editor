import { isStr } from '@open-editor/shared';
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
    if (isSource(debug, options)) {
      resolveSource(debug, tree, deep, options);
    } else {
      resolveInstance(debug.value, tree, deep, options);
    }
  };
}

function resolveSource<T = any>(
  debug: ResolveDebug<T>,
  tree: Partial<ElementSourceMeta>[],
  deep: boolean,
  options: VueResolverOptions,
) {
  const { isValid, isValidNext, getNext, getSource, getFile, getName } =
    options;

  let [instance, source] = getAnchor(debug, options);

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
        source = parseSource(__source);
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

function getAnchor<T = any>(
  debug: ResolveDebug,
  options: Pick<VueResolverOptions<T>, 'isValidNext' | 'getSource' | 'getNext'>,
) {
  const { isValidNext, getSource, getNext } = options;

  let instance = debug.value;
  let element = debug.originalElement as HTMLElement & Record<string, any>;
  let __source: string | null | undefined;

  // find the first element with __source
  while (element && !isStr((__source = element.getAttribute('__source')))) {
    element = element.parentElement!;
  }
  // if the element exists and belongs to the component, the result is returned
  if (element) {
    if (element[debug.key] ? element[debug.key] === instance : true) {
      return <const>[instance, parseSource(__source!)];
    }
  }
  // the root component returns the result directly
  if (isStr(__source) && !isValidNext(instance)) {
    return <const>[instance, parseSource(__source)];
  }
  // try to get the result from the component
  while (instance) {
    if (isStr((__source = getSource(instance)))) {
      return <const>[getNext(instance), parseSource(__source)];
    }
    instance = getNext(instance);
  }

  return [];
}

function resolveInstance<T = any>(
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

function parseSource(__source: string) {
  const [file, line, column] = __source.split(':');
  return {
    file: ensureFileName(file),
    line: Number(line),
    column: Number(column),
  };
}

let isSourceResult: boolean | undefined;
function isSource<T = any>(
  debug: ResolveDebug,
  options: Pick<VueResolverOptions<T>, 'getSource' | 'getNext'>,
) {
  return (isSourceResult ??= getIsSourceResult(debug, options));
}

function getIsSourceResult<T = any>(
  debug: ResolveDebug,
  options: Pick<VueResolverOptions<T>, 'getSource' | 'getNext'>,
) {
  if (document.querySelector('*[__source]')) {
    return true;
  }

  const { getNext, getSource } = options;
  let { value: instance } = debug;
  while (instance) {
    if (isStr(getSource(instance))) {
      return true;
    }
    instance = getNext(instance);
  }

  return false;
}

const nameRE = /([^/.]+)\.(vue|jsx|tsx)$/;
function getNameByFile(file = '') {
  return file.match(nameRE)?.[1];
}
