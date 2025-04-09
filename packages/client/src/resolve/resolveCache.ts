import { CodeSourceMeta } from '.';

/**
 * 缓存条目值结构定义
 *
 * @remarks
 * - 当前设计为单字段结构，未来可扩展缓存版本号、过期时间等字段
 * - 典型使用场景：在 DOM 元素生命周期中持久化存储其关联的源码元数据
 */
export type CacheValue = {
  /**
   * 关联的源码元数据
   *
   * @description
   * - 用于组件渲染时的快速溯源，包含组件名称、源码路径等调试信息
   * - 该元数据应与其绑定的 DOM 元素保持相同生命周期
   * - 当元素被移除时，该元数据会随 WeakMap 机制自动释放
   */
  meta?: CodeSourceMeta;
};

/**
 * 基于 WeakMap 的持久化缓存存储
 *
 * @technical_detail
 * - **键值类型**  : HTMLElement → CacheValue（DOM元素弱引用）
 * - **回收机制**  : 元素从 DOM 树移除时自动触发垃圾回收
 * - **容量策略**  : 依赖浏览器 GC 机制动态管理，无需手动清理
 * - **内存安全**  : 弱键特性防止内存泄漏，长期未用元素自动释放
 * - **设计优势**  : 天然防内存溢出，特别适合 DOM 元数据缓存场景
 * - **类型安全**  : 通过泛型约束保证键值类型匹配，避免类型错误
 */
const cache = new WeakMap<HTMLElement, CacheValue>();

/**
 * 获取指定 DOM 元素关联的缓存数据
 *
 * @param el - 需要查询的 DOM 元素节点
 *
 * @returns 关联的缓存数据，若不存在或已回收则返回 undefined
 */
export function getCache(el: HTMLElement) {
  return cache.get(el);
}

/**
 * 设置 DOM 元素关联的缓存数据
 *
 * @param el - 需要缓存的 DOM 元素节点
 * @param value - 要存储的缓存数据对象
 */
export function setCache(el: HTMLElement, value: CacheValue) {
  cache.set(el, value);
}
