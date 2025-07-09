import { CodeSourceMeta } from '.';

/**
 * 缓存条目值结构定义
 * @remarks
 * - 当前设计为单字段结构，未来可扩展缓存版本号、过期时间等字段
 * - 在 DOM 元素生命周期中持久化存储其关联的源码元数据
 */
export type CacheValue = {
  /**
   * 关联的源码元数据
   */
  meta?: CodeSourceMeta;
};

/**
 * 基于 WeakMap 的持久化缓存存储
 */
const cache = new WeakMap<HTMLElement, CacheValue>();

/**
 * 获取指定 DOM 元素关联的缓存数据
 * @param el - 需要查询的 DOM 元素节点
 * @returns 关联的缓存数据，若不存在或已回收则返回 undefined
 */
export function getCache(el: HTMLElement) {
  return cache.get(el);
}

/**
 * 设置 DOM 元素关联的缓存数据
 * @param el - 需要缓存的 DOM 元素节点
 * @param value - 要存储的缓存数据对象
 */
export function setCache(el: HTMLElement, value: CacheValue) {
  cache.set(el, value);
}
