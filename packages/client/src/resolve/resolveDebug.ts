import { isValidElement } from '../utils/element';

export type ResolveDebug<T = any> = {
  element: HTMLElement;
  key: string;
  value?: T | null;
};

const reactKeyStarts = '__reactFiber$';
const react15KeyStarts = '__reactInternalInstance$';
// __reactFiber$xxx...
export let reactKey: string | undefined;
// __reactInternalInstance$xxx...
export let react15Key: string | undefined;

export const vueKey = '__vueParentComponent';
export const vue2Key = '__vue__';

// support parsing single project multiple frameworks
export function resolveDebug(element: HTMLElement): ResolveDebug | undefined {
  while (isValidElement(element)) {
    const key = findKey(element);
    if (key) {
      const value = (<any>element)[key];
      if (value) return { element, key, value };
    }
    element = element.parentElement!;
  }
}

function findKey(element: HTMLElement) {
  // vue3+
  if (vueKey in element) {
    return vueKey;
  }
  // vue2+
  else if (vue2Key in element) {
    return vue2Key;
  }

  // react17+
  if (!reactKey) {
    reactKey = findStartsWith(element, reactKeyStarts);
  }
  if (reactKey && reactKey in element) {
    return reactKey;
  }

  // react15+
  if (!react15Key) {
    react15Key = findStartsWith(element, react15KeyStarts);
  }
  if (react15Key && react15Key in element) {
    return react15Key;
  }
}

function findStartsWith(element: HTMLElement, starts: string) {
  return Object.keys(element).find((key) => key.startsWith(starts));
}
