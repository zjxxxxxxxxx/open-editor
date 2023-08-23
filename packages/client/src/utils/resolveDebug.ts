import { isValidElement } from './element';

const reactKeyStarts = '__reactFiber$';
const react15KeyStarts = '__reactInternalInstance$';
// __reactFiber$xxx...
let reactKey: string | undefined;
// __reactInternalInstance$xxx...
let react15Key: string | undefined;

const vueKey = '__vueParentComponent';
const vue2Key = '__vue__';
const svelteKey = '__svelte_meta';
const qwikKey = '_qc_';

// support parsing single project multiple frameworks
export function resolveDebug(element: HTMLElement) {
  while (isValidElement(element)) {
    const key = findKey(element);
    if (key) {
      const value = (<any>element)[key];
      if (value) return { key, value };
    }
    element = element.parentElement!;
  }
}

function findKey(element: HTMLElement) {
  // vue3+
  if (vueKey in element) {
    return vueKey;
  }
  // vue+
  else if (vue2Key in element) {
    return vue2Key;
  }
  // svelte?+
  else if (svelteKey in element) {
    return svelteKey;
  }
  // qwik?+
  else if (qwikKey in element) {
    return qwikKey;
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
