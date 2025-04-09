// React 相关模块路径配置
const REACT_PATHS = {
  /** React 15 版本主模块路径 */
  V15: normalizePath('react/react.js'),
  /** React 17+ 版本主模块路径 */
  V17: normalizePath('react/index.js'),
};

// Vue 相关模块路径配置
const VUE_PATHS = {
  /** Vue 2 版本 CommonJS 格式模块路径 */
  V2_COMMONJS: normalizePath('vue/dist/vue.runtime.common.js'),
  /** Vue 2 版本 ESM 格式模块路径 */
  V2_ESM: normalizePath('vue/dist/vue.runtime.esm.js'),
  /** Vue 3 版本主模块路径 */
  V3: normalizePath('vue/index.js'),
  /** Vue 3 版本 ESM 格式模块路径 */
  V3_ESM: normalizePath('vue/dist/vue.runtime.esm-bundler.js'),
};

// 合并所有需要匹配的模块路径
const ALL_MODULE_PATHS = [...Object.values(REACT_PATHS), ...Object.values(VUE_PATHS)];

// 合并需要匹配 ESM 格式的模块路径
const ESM_MODULE_PATHS = [VUE_PATHS.V2_ESM, VUE_PATHS.V3_ESM];

/**
 * 客户端模块标识常量，用于标识需要特殊处理的编辑器客户端模块
 */
export const CLIENT_MODULE_ID = '@open-editor/client';

/**
 * 通用模块路径匹配正则表达式，用于检测所有支持的框架模块路径
 */
export const ENTRY_MATCH_RE = createMatchRE(ALL_MODULE_PATHS);

/**
 * ESM 模块路径匹配正则表达式，专门用于检测 ESM 格式的框架模块路径
 */
export const ENTRY_ESM_MATCH_RE = createMatchRE(ESM_MODULE_PATHS);

/**
 * 路径标准化处理函数
 * - 将输入路径转换为正则表达式格式
 * - 自动处理模块路径中的特殊字符和路径分隔符
 */
function normalizePath(path: string) {
  // 转义路径中的点号(.)，避免被正则解析为通配符
  const escapedDotPath = path.replace(/\./g, '\\.');
  // 将路径分隔符转换为兼容 Windows/Linux 的正则表达式格式
  return `/node_modules/${escapedDotPath}`.replace(/\//g, '[\\\\/]');
}

/**
 * 正则表达式生成函数
 *
 * @param paths 经过标准化的路径数组
 *
 * @returns 合并后的正则表达式，用于匹配模块路径
 */
function createMatchRE(paths: string[]) {
  return RegExp(`(${paths.join('|')})$`);
}
