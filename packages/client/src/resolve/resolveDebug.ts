import { isValidElement } from '../utils/validElement';

export type ResolveDebug<T = any> = {
  originalElement: HTMLElement;
  element: HTMLElement;
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
export function resolveDebug(element: HTMLElement): ResolveDebug | undefined {
  const originalElement = element;
  while (isValidElement(element)) {
    const key = findKey(element);
    if (key) {
      const value = (<any>element)[key];
      if (value) return { originalElement, element, key, value };
    }
    element = element.parentElement!;
  }
}

function findKey(element: HTMLElement) {
  // vue3+
  if (vue3Key in element) {
    return vue3Key;
  }
  // vue2+
  else if (vue2Key in element) {
    return vue2Key;
  }

  // react17+
  if (!react17PlusKey) {
    react17PlusKey = findStartsWith(element, react17PlusKeyStarts);
  }
  if (react17PlusKey && react17PlusKey in element) {
    return react17PlusKey;
  }

  // react15+
  if (!react15PlusKey) {
    react15PlusKey = findStartsWith(element, react15PlusKeyStarts);
  }
  if (react15PlusKey && react15PlusKey in element) {
    return react15PlusKey;
  }
}

function findStartsWith(element: HTMLElement, starts: string) {
  return Object.keys(element).find((key) => key.startsWith(starts));
}
