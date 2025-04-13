/**
 * 轻量级事件总线实现（仿 mitt 设计）
 *
 * 核心功能：事件订阅/发布、一次性监听、批量清理
 *
 * @template T - 事件参数类型，默认为空数组（无参数事件）
 */
export function mitt<T extends unknown[] = []>() {
  // 使用 Set 存储监听函数，自动处理重复项
  const listeners = new Set<(...args: T) => void>();

  return {
    /** 当前是否存在活跃监听器 */
    get isEmpty() {
      return listeners.size === 0;
    },

    /**
     * 注册持久事件监听
     *
     * @param handler - 事件处理函数
     *
     * @example bus.on((msg) => console.log(msg))
     */
    on(handler: (...args: T) => void) {
      listeners.add(handler);
    },

    /**
     * 注册一次性事件监听
     *
     * @param handler - 仅执行一次的处理函数
     *
     * @example bus.once((msg) => console.log('首次消息:', msg))
     */
    once(handler: (...args: T) => void) {
      const wrapOnceFn = (...args: T) => {
        // 自动解除
        listeners.delete(wrapOnceFn);
        handler(...args);
      };
      listeners.add(wrapOnceFn);
    },

    /**
     * 移除指定事件监听
     *
     * @param handler - 需要移除的处理函数
     */
    off(handler: (...args: T) => void) {
      listeners.delete(handler);
    },

    /** 清除所有事件监听 */
    clear() {
      listeners.clear();
    },

    /**
     * 触发事件通知
     *
     * @param args - 传递给监听函数的参数
     *
     * @example bus.emit('新消息')
     */
    emit(...args: T) {
      // 创建副本避免迭代过程中修改导致的异常
      const safeListeners = new Set(listeners);
      safeListeners.forEach((fn) => fn(...args));
    },
  };
}
