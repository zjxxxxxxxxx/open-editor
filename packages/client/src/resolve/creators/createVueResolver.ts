import { isStr } from '@open-editor/shared';
import type { SourceCodeMeta } from '../';
import type { ResolveDebug } from '../resolveDebug';
import { ensureFileName, isValidFileName } from '../util';

interface VueResolverOptions<T = any> {
  isValid(v: T): boolean;
  getNext(v: T): T | null | undefined;
  getSource(v: T): string | undefined;
  getFile(v: T): string | undefined;
  getName(v: T): string | undefined;
}

export function createVueResolver<T = any>(opts: VueResolverOptions<T>) {
  function vueResolver(
    debug: ResolveDebug<T>,
    tree: Partial<SourceCodeMeta>[],
    deep: boolean,
  ) {
    const { isValid, getNext, getSource, getFile, getName } = opts;
    const record = new Set<string>();
    let [inst, source] = getAnchor(debug, getSource);

    while (isValid(inst)) {
      const file = getFile(inst);
      if (isValidFileName(file)) {
        if (source) {
          if (resolveForSource(file)) return;
        } else {
          if (resolveForFile(file)) return;
        }
      }

      inst = getNext(inst);
    }

    function resolveForSource(file: string) {
      const parsedSource = parsePath(source);
      const parsedFile = parsePath(file);

      if (parsedSource.file === parsedFile.file) {
        if (!record.has(parsedSource.file)) {
          push(inst, parsedSource);
          source = getSource(inst);
        }

        return !deep;
      }
    }

    function resolveForFile(file: string) {
      const parsedFile = parsePath(file);

      if (!record.has(parsedFile.file)) {
        push(inst, parsedFile);
      }

      return !deep;
    }

    function push(inst: any, meta: any) {
      record.add(meta.file);
      tree.push({
        name: getName(inst) ?? getNameForFile(meta.file),
        ...meta,
      });
    }
  }

  return vueResolver;
}

function getAnchor<T = any>(
  debug: ResolveDebug,
  getSource: VueResolverOptions<T>['getSource'],
) {
  const source = debug.el.getAttribute('__source');
  while (isStr(source)) {
    return [debug.value, source];
  }
  return [debug.value, getSource(debug.value)];
}

const splitRE = /:(?=\d)/;
function parsePath(source: string) {
  const [f, l = 1, c = 1] = source.split(splitRE)!;
  return {
    file: ensureFileName(f),
    line: Number(l),
    column: Number(c),
  };
}

const nameRE = /([^/]+)\.[^.]+$/;
function getNameForFile(file = '') {
  const [, n] = file.match(nameRE)!;
  return n;
}
