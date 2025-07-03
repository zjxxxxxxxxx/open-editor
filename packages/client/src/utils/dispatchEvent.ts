// 预定义事件基础选项（符合 DOM 事件规范）
const BASE_EVENT_OPTIONS = {
  // 允许事件冒泡
  bubbles: true,
  // 允许取消事件
  cancelable: true,
  // 跨越 Shadow DOM 边界
  composed: true,
};

/**
 * 分发标准化自定义事件
 *
 * @param type - 事件类型标识符
 * @param detail - 事件携带数据（可选，需可序列化）
 * @returns 事件是否被取消（true 表示未被取消）
 *
 * @example
 * // 分发带数据的自定义事件
 * dispatchEvent('user-update', { id: 123, name: 'John' });
 */
export function dispatchEvent(type: string, detail?: AnyObject) {
  // 合并基础配置与事件数据
  const options = {
    ...BASE_EVENT_OPTIONS,
    detail,
  };

  // 创建标准化事件对象
  const customEvent = new CustomEvent(type, options);

  // 全局分发并返回处理结果
  return window.dispatchEvent(customEvent);
}
