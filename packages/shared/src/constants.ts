const REACT_15_PATH = normalizePath('react/react.js');
const REACT_17_PATH = normalizePath('react/index.js');
const VUE_2_PATH = normalizePath('vue/dist/vue.runtime.common.js');
const VUE_2_ESM_PATH = normalizePath('vue/dist/vue.runtime.esm.js');
const VUE_3_PATH = normalizePath('vue/index.js');
const VUE_3_ESM_PATH = normalizePath('vue/dist/vue.runtime.esm-bundler.js');

export const ENTRY_MATCH_RE = createMatchRE([
  REACT_15_PATH,
  REACT_17_PATH,
  VUE_2_PATH,
  VUE_2_ESM_PATH,
  VUE_3_PATH,
  VUE_3_ESM_PATH,
]);

export const ENTRY_ESM_MATCH_RE = createMatchRE([VUE_2_ESM_PATH, VUE_3_ESM_PATH]);

export const CLIENT_MODULE_ID = '@open-editor/client';

function normalizePath(path: string) {
  return `/node_modules/${path.replace(/\./g, '\\.')}`.replace(/\//g, '[\\\\/]');
}

function createMatchRE(paths: string[]) {
  return RegExp(`(${paths.join('|')})$`);
}
