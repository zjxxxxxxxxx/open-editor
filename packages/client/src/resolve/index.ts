import { CURRENT_INSPECT_ID } from '../constants';
import { resolveReact17 } from './resolveReact17';
import { resolveReact15 } from './resolveReact15';
import { resolveVue3 } from './resolveVue3';
import { resolveVue2 } from './resolveVue2';
import { resolveDebug } from './resolveDebug';

/**
 * 源码元数据结构定义
 */
export interface CodeSourceMeta {
  /** 组件/节点名称（经过驼峰化处理） */
  name: string;
  /** 源代码文件绝对路径 */
  file: string;
  /** 代码行号（1-based） */
  line: number;
  /** 代码列号（1-based） */
  column: number;
}

/**
 * 调试源码信息结构
 */
export interface CodeSource {
  /** 当前检测会话ID */
  id: string;
  /** 目标DOM元素标签名 */
  el: string;
  /** 首条有效元数据（快捷访问） */
  meta?: CodeSourceMeta;
  /** 完整的组件层级溯源数据 */
  tree: CodeSourceMeta[];
}
/**
 * 框架解析器映射表
 * 根据调试属性特征匹配对应的框架解析器
 */
const FRAME_RESOLVERS = {
  __reactFiber: resolveReact17, // React 17+ Fiber架构
  __reactInternal: resolveReact15, // React 15 内部实例
  __vueParent: resolveVue3, // Vue 3 父组件链
  __vue: resolveVue2, // Vue 2 实例
} as const;

/**
 * 解析DOM元素的源码定位信息
 * @param el - 目标DOM元素
 * @param deep - 是否深度解析组件树
 * @returns 包含源码定位信息的对象
 *
 * 实现流程：
 * 1. 初始化基础数据结构
 * 2. 提取元素调试信息
 * 3. 根据调试信息特征选择解析器
 * 4. 执行框架特定的源码解析
 * 5. 设置主元数据引用
 */
export function resolveSource(el: HTMLElement, deep?: boolean): CodeSource {
  // 初始化返回数据结构
  const source: CodeSource = {
    id: CURRENT_INSPECT_ID,
    el: el.localName,
    tree: [],
  };

  // 提取元素的调试元数据（参考Vue/React调试属性）
  const debugInfo = resolveDebug(el);
  if (!debugInfo) return source;

  // 根据调试属性特征匹配解析器
  const resolverKey = Object.keys(FRAME_RESOLVERS).find((key) => debugInfo.key.startsWith(key));

  if (resolverKey) {
    // 执行对应框架的源码解析
    FRAME_RESOLVERS[resolverKey](debugInfo, source.tree, deep);
  }

  // 设置首个有效元数据为主要引用
  source.meta = source.tree[0];

  return source;
}
