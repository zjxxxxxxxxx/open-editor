import { hasOwnProperty } from '@open-editor/shared';
import { checkValidElement } from '../utils/ui';

export type ResolveDebug<T = any> = {
  el: HTMLElement;
  key: string;
  value?: T | null;
};

const react17PlusKeyStarts = '__reactFiber$';
const react15PlusKeyStarts = '__reactInternalInstance$';
// __reactFiber$xxx...
export let react17PlusKey: string | undefined;
// __reactInternalInstance$xxx...
export let react15PlusKey: string | undefined;

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
  else if (hasOwnProperty(el, vue2Key)) {
    return vue2Key;
  }

  // react17+
  react17PlusKey ||= startsWith(el, react17PlusKeyStarts);
  if (react17PlusKey && hasOwnProperty(el, react17PlusKey)) {
    return react17PlusKey;
  }

  // react15+
  react15PlusKey ||= startsWith(el, react15PlusKeyStarts);
  if (react15PlusKey && hasOwnProperty(el, react15PlusKey)) {
    return react15PlusKey;
  }
}

function startsWith(el: HTMLElement, starts: string) {
  return Object.keys(el).find((key) => key.startsWith(starts));
}
