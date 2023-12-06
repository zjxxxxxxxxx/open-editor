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

export function createVueResolver<T = any>(opts: VueResolverOptions<T>) {
  return function vueResolver(
    debug: ResolveDebug<T>,
    tree: Partial<ElementSourceMeta>[],
    deep: boolean,
  ) {
    if (isSource(debug, opts)) {
      resolveSource(debug, tree, deep, opts);
    } else {
      resolveInstance(debug.value, tree, deep, opts);
    }
  };
}

function resolveSource<T = any>(
  debug: ResolveDebug<T>,
  tree: Partial<ElementSourceMeta>[],
  deep: boolean,
  opts: VueResolverOptions,
) {
  const { isValid, isValidNext, getNext, getSource, getFile, getName } = opts;

  let [inst, source] = getAnchor(debug, opts);

  while (isValid(inst)) {
    if (isValidNext(inst)) {
      const __source = getSource(inst);
      const __file = getFile(inst);
      if (
        isStr(__source) &&
        isValidFileName(__file) &&
        ensureFileName(__file) === source.file
      ) {
        push(inst);

        if (!deep) return;
        source = parseSource(__source);
      }
    } else {
      push(inst);
    }

    inst = getNext(inst);
  }

  function push(inst: T) {
    tree.push({
      name: getName(inst) ?? getNameByFile(getFile(inst)),
      ...source,
    });
  }
}

function getAnchor<T = any>(
  debug: ResolveDebug,
  opts: Pick<VueResolverOptions<T>, 'isValidNext' | 'getSource' | 'getNext'>,
) {
  const { isValidNext, getSource, getNext } = opts;

  let inst = debug.value;
  let el = debug.originalEl as HTMLElement & Record<string, any>;
  let __source: string | null | undefined;

  // find the first el with __source
  while (el && !isStr((__source = el.getAttribute('__source')))) {
    el = el.parentElement!;
  }
  // if the el exists and belongs to the component, the result is returned
  if (el) {
    if (el[debug.key] ? el[debug.key] === inst : true) {
      return <const>[inst, parseSource(__source!)];
    }
  }
  // the root component returns the result directly
  if (isStr(__source) && !isValidNext(inst)) {
    return <const>[inst, parseSource(__source)];
  }
  // try to get the result from the component
  while (inst) {
    if (isStr((__source = getSource(inst)))) {
      return <const>[getNext(inst), parseSource(__source)];
    }
    inst = getNext(inst);
  }

  return [];
}

function resolveInstance<T = any>(
  inst: T,
  tree: Partial<ElementSourceMeta>[],
  deep: boolean,
  opts: VueResolverOptions,
) {
  const { isValid, getNext, getFile, getName } = opts;

  while (isValid(inst)) {
    const __file = getFile(inst);
    if (isValidFileName(__file)) {
      tree.push({
        name: getName(inst) ?? getNameByFile(__file),
        file: __file,
      });

      if (!deep) return;
    }

    inst = getNext(inst);
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
  opts: Pick<VueResolverOptions<T>, 'getSource' | 'getNext'>,
) {
  return (isSourceResult ??= getIsSourceResult(debug, opts));
}

function getIsSourceResult<T = any>(
  debug: ResolveDebug,
  opts: Pick<VueResolverOptions<T>, 'getSource' | 'getNext'>,
) {
  if (document.querySelector('*[__source]')) {
    return true;
  }

  const { getNext, getSource } = opts;
  let { value: inst } = debug;
  while (inst) {
    if (isStr(getSource(inst))) {
      return true;
    }
    inst = getNext(inst);
  }

  return false;
}

const nameRE = /([^/.]+)\.[^.]+$/;
function getNameByFile(file = '') {
  return file.match(nameRE)?.[1];
}
