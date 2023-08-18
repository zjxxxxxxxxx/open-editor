const vueKey = '__vueParentComponent';
const svelteKey = '__svelte_meta';
const reactKeyStarts = '__reactFiber';
const react15KeyStarts = '__reactInternalInstance';

let reactKey: string | undefined;
let react15Key: string | undefined;

// support parsing single project multiple frameworks
export function resolveKey(element: HTMLElement) {
  // vue3+
  if (vueKey in element) {
    return vueKey;
  }
  // svelte?+
  else if (svelteKey in element) {
    return svelteKey;
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
