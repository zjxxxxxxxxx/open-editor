import { isValidElement } from '../utils/validElement';

export type ResolveDebug<T = any> = {
  originalEl: HTMLElement;
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
  const originalEl = el;
  while (isValidElement(el)) {
    const key = findKey(el);
    if (key) {
      const value = (<any>el)[key];
      if (value) return { originalEl, el, key, value };
    }
    el = el.parentElement!;
  }
}

function findKey(el: HTMLElement) {
  // vue3+
  if (vue3Key in el) {
    return vue3Key;
  }
  // vue2+
  else if (vue2Key in el) {
    return vue2Key;
  }

  // react17+
  react17PlusKey ||= findStartsWith(el, react17PlusKeyStarts);
  if (react17PlusKey && react17PlusKey in el) {
    return react17PlusKey;
  }

  // react15+
  react15PlusKey ||= findStartsWith(el, react15PlusKeyStarts);
  if (react15PlusKey && react15PlusKey in el) {
    return react15PlusKey;
  }
}

function findStartsWith(el: HTMLElement, starts: string) {
  return Object.keys(el).find((key) => key.startsWith(starts));
}
