import { hasOwnProperty } from '@open-editor/shared';
import { checkValidElement } from '../utils/checkElement';

export type ResolveDebug<T = any> = {
  el: HTMLElement;
  key: string;
  value?: T | null;
};

const react17KeySearch = '__reactFiber$';
const react15KeySearch = '__reactInternalInstance$';

export const vue3Key = '__vueParentComponent';
export const vue2Key = '__vue__';

// support parsing single project multiple frameworks
export function resolveDebug(el: HTMLElement): ResolveDebug | undefined {
  while (checkValidElement(el)) {
    const key = findKey(el);
    if (key) {
      const value = (<any>el)[key];
      if (value) return { el, key, value };
    }
    el = el.parentElement!;
  }
}

function findKey(el: HTMLElement) {
  // vue3+
  if (hasOwnProperty(el, vue3Key)) {
    return vue3Key;
  }

  // vue2+
  if (hasOwnProperty(el, vue2Key)) {
    return vue2Key;
  }

  // react17+
  const react17Key = startsWith(el, react17KeySearch);
  if (react17Key) {
    return react17Key;
  }

  // react15+
  const react15Key = startsWith(el, react15KeySearch);
  if (react15Key) {
    return react15Key;
  }
}

function startsWith(el: HTMLElement, search: string) {
  return Object.keys(el).find((key) => key.startsWith(search));
}
