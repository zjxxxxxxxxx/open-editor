import { isStr } from '@open-editor/shared';
import type { SourceCodeMeta } from '../';
import type { ResolveDebug } from '../resolveDebug';
import { ensureFileName, isValidFileName } from '../util';

interface VueResolverOptions<T = any> {
  isValid(instance: T): boolean;
  getNext(instance: T): T | null | undefined;
  getSource(instance: T): string | undefined;
  getFile(instance: T): string;
  getName(instance: T): string | undefined;
}

export function createVueResolver<T = any>(opts: VueResolverOptions<T>) {
  return function vueResolver(
    debug: ResolveDebug<T>,
    tree: Partial<SourceCodeMeta>[],
    deep: boolean,
  ) {
    const { isValid, getNext, getSource, getFile, getName } = opts;

    const fileSet = new Set<string>();
    let [inst, source] = getAnchor(debug, getSource);

    while (isValid(inst)) {
      const file = getFile(inst);
      if (isValidFileName(file)) {
        const parsedFile = parseVueSource(file);
        if (source) {
          const parsedSource = parseVueSource(source);
          if (parsedSource.file === parsedFile.file) {
            push(inst, parsedSource, () => (source = getSource(inst)));
          }
        } else {
          push(inst, parsedFile);
        }

        if (!deep) return;
      }

      inst = getNext(inst);
    }

    function push(inst: any, source: any, done?: () => void) {
      if (!fileSet.has(source.file)) {
        fileSet.add(source.file);
        tree.push({
          name: getName(inst) ?? getNameByFile(source.file),
          ...source,
        });
        done?.();
      }
    }
  };
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

function parseVueSource(source: string) {
  const [file, line = 1, column = 1] = source.split(':', 3);
  return {
    file: ensureFileName(file),
    line: Number(line),
    column: Number(column),
  };
}

const nameRE = /([^/.]+)\.[^.]+$/;
function getNameByFile(file = '') {
  return file.match(nameRE)?.[1];
}
