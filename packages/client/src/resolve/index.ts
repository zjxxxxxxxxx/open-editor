import { DS, type DSValue } from '@open-editor/shared/debugSource';
import { CURRENT_INSPECT_ID } from '../constants';
import { getCache, setCache } from './resolveCache';
import { resolveReact17 } from './resolveReact17';
import { resolveReact15 } from './resolveReact15';
import { resolveVue3 } from './resolveVue3';
import { resolveVue2 } from './resolveVue2';
import { resolveDebug } from './resolveDebug';

/**
 * 组件级源码定位元数据
 *
 * @description 用于描述组件在源码中的精确位置信息，兼容多框架格式
 */
export interface CodeSourceMeta extends DSValue {
  /**
   * 组件名称
   */
  name: string;
}

/**
 * 调试会话上下文数据
 */
export interface CodeSource {
  /**
   * 检测会话唯一标识（UUID 格式，多窗口隔离）
   */
  id: string;
  /**
   * 目标元素标签名（保留 XML 命名空间）
   *
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
   *
   * @remarks
   * - [0]: 当前组件
   * - [n]: 根组件
   */
  tree: CodeSourceMeta[];
}

/**
 * 框架调试适配器注册表
 *
 * @description 实现框架调试协议自动检测，支持主流框架版本
 *
 * | 特征属性         | 框架版本      | 适配器       |
 * |------------------|-------------|-------------|
 * | __reactFiber     | React 17+   | resolveReact17 |
 * | __reactInternal  | React 15-16 | resolveReact15 |
 * | __vueParent      | Vue 3       | resolveVue3   |
 * | __vue            | Vue 2       | resolveVue2   |
 *
 * @remarks 使用 const 断言确保类型安全
 */
const FRAME_RESOLVERS = {
  [DS.REACT_17]: resolveReact17,
  [DS.REACT_15]: resolveReact15,
  [DS.VUE_3]: resolveVue3,
  [DS.VUE_2]: resolveVue2,
} as const;

/**
 * 解析 DOM 元素的源码映射信息
 *
 * @param el 目标元素（需包含 __vue/__react 等调试属性）
 * @param deep 深度解析模式（默认 false）
 * @returns 标准化调试数据
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
    // 使用全局唯一会话 ID
    id: CURRENT_INSPECT_ID,
    // 获取带命名空间的标签名
    el: el.localName,
    // 延迟初始化元数据
    meta: undefined,
    // 组件树存储容器
    tree: [],
  };

  /**
   * 快速返回路径（非深度模式）
   */
  if (!deep) {
    const cached = getCache(el);
    if (cached) {
      // 从缓存加载元数据
      source.meta = cached.meta;
      // 提前返回避免后续计算
      return source;
    }
  }

  // 提取标准化调试信息（跨框架抽象层）
  const debugInfo = resolveDebug(el);
  if (debugInfo) {
    /**
     * 框架类型自动检测算法
     */
    const resolverKey = Object.keys(FRAME_RESOLVERS).find((key) => debugInfo.key.startsWith(key));
    // 执行框架特定解析逻辑
    if (resolverKey) {
      /**
       * 框架适配器执行过程
       */
      FRAME_RESOLVERS[resolverKey](debugInfo.value, source.tree, deep);
    }

    // 设置主元数据引用点（总是取当前组件）
    source.meta = source.tree[0];
  }

  /**
   * 缓存更新策略
   */
  if (!deep) {
    setCache(el, { meta: source.meta });
  }

  return source;
}
