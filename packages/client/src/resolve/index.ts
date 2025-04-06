import { CURRENT_INSPECT_ID } from '../constants';
import { getCache, setCache } from './resolveCache';
import { resolveReact17 } from './resolveReact17';
import { resolveReact15 } from './resolveReact15';
import { resolveVue3 } from './resolveVue3';
import { resolveVue2 } from './resolveVue2';
import { resolveDebug } from './resolveDebug';

/**
 * 组件级源码定位元数据
 * @description 用于描述组件在源码中的精确位置信息，兼容多框架格式
 */
export interface CodeSourceMeta {
  /**
   * 组件规范化名称（框架无关格式）
   * @example
   * - React组件: 'MyComponent'
   * - Vue组件: 'VueComponent'
   */
  name: string;
  /**
   * 源码映射路径（已解析webpack/vite路径别名）
   * @example 'src/components/MyComponent.tsx'
   */
  file: string;
  /**
   * 源码行号（符合IDE调试协议）
   * @remark 生产环境需配合sourcemap使用
   */
  line: number;
  /**
   * 源码列号（JSX元素精准定位）
   * @example
   * - JSX开始标签: 列号对应'<'位置
   */
  column: number;
}

/**
 * 调试会话上下文数据
 * @description 包含完整的调试会话信息，支持多窗口隔离调试
 */
export interface CodeSource {
  /**
   * 检测会话唯一标识（UUID格式，多窗口隔离）
   */
  id: string;
  /**
   * 目标元素标签名（保留XML命名空间）
   * @example
   * - 'div'
   * - 'svg:path'
   */
  el: string;
  /**
   * 组件树根节点元数据（快速访问入口）
   */
  meta?: CodeSourceMeta;
  /**
   * 完整组件调用链路（支持树形可视化）
   * @remark
   * - [0]: 当前组件
   * - [n]: 根组件
   */
  tree: CodeSourceMeta[];
}

/**
 * 框架调试适配器注册表
 * @description 实现框架调试协议自动检测，支持主流框架版本
 *
 * | 特征属性         | 框架版本      | 适配器       |
 * |------------------|-------------|-------------|
 * | __reactFiber     | React 17+   | resolveReact17 |
 * | __reactInternal  | React 15-16 | resolveReact15 |
 * | __vueParent      | Vue 3       | resolveVue3   |
 * | __vue            | Vue 2       | resolveVue2   |
 *
 * @remark 使用const断言确保类型安全
 */
const FRAME_RESOLVERS = {
  __reactFiber: resolveReact17,
  __reactInternal: resolveReact15,
  __vueParent: resolveVue3,
  __vue: resolveVue2,
} as const;

/**
 * 解析DOM元素的源码映射信息
 * @param el 目标元素（需包含__vue/__react等调试属性）
 * @param deep 深度解析模式（默认false）
 * @returns 标准化调试数据
 *
 * @coreLogic
 * 1. 缓存优先策略 - 浅层模式直接读取L1缓存
 * 2. 元数据提取 - 通过 debug 属性标准化框架差异
 * 3. 动态适配 - 根据调试属性特征选择解析器
 * 4. 数据持久化 - 双缓存策略（闭包缓存 + WeakMap）
 *
 * @performance
 * - 浅层模式时间复杂度：O(1)（缓存直接命中）
 * - 深度模式时间复杂度：O(n)（n为组件树深度）
 * - 内存管理：WeakMap自动GC防止内存泄漏
 *
 * @example
 * // 快速获取组件元数据
 * const meta = resolveSource(document.getElementById('app')).meta;
 *
 * // 深度解析组件树
 * const fullTree = resolveSource(document.getElementById('app'), true).tree;
 */
export function resolveSource(el: HTMLElement, deep?: boolean): CodeSource {
  // 初始化上下文容器（实现会话隔离）
  const source: CodeSource = {
    id: CURRENT_INSPECT_ID, // 使用全局唯一会话ID
    el: el.localName, // 获取带命名空间的标签名
    meta: undefined, // 延迟初始化元数据
    tree: [], // 组件树存储容器
  };

  /**
   * 快速返回路径（非深度模式）
   * @condition 当满足以下条件时直接返回缓存：
   * 1. deep参数为false或undefined
   * 2. 缓存中存在有效数据
   */
  if (!deep) {
    const cached = getCache(el);
    if (cached) {
      source.meta = cached.meta; // 从缓存加载元数据
      return source; // 提前返回避免后续计算
    }
  }

  // 提取标准化调试信息（跨框架抽象层）
  const debugInfo = resolveDebug(el);
  if (debugInfo) {
    /**
     * 框架类型自动检测算法
     * @algorithm
     * 1. 遍历所有已注册框架特征键
     * 2. 使用String.startsWith进行前缀匹配
     * 3. 返回第一个匹配成功的解析器
     */
    const resolverKey = Object.keys(FRAME_RESOLVERS).find((key) => debugInfo.key.startsWith(key));

    // 执行框架特定解析逻辑
    if (resolverKey) {
      /**
       * 框架适配器执行过程
       * @process
       * 1. 传入标准化调试信息
       * 2. 递归解析组件树（深度模式时）
       * 3. 填充source.tree数组
       */
      FRAME_RESOLVERS[resolverKey](debugInfo, source.tree, deep);
    }

    // 设置主元数据引用点（总是取当前组件）
    source.meta = source.tree[0];
  }

  /**
   * 缓存更新策略
   * @strategy
   * 1. 仅非深度模式更新缓存
   * 2. 避免缓存大型组件树数据
   * 3. 使用WeakMap自动内存管理
   */
  if (!deep) {
    setCache(el, { meta: source.meta });
  }

  return source;
}
