/**
 * 创建快速退出事件分发器模块
 * 功能：监听ESC按键和右键点击事件触发退出逻辑
 */
import {
  type SetupDispatcherListener,
  type SetupDispatcherListenerOptions,
  createCustomEventDispatcher,
} from './create';
import { off, on } from '.';

// 导出预配置的快速退出事件分发器
export default createCustomEventDispatcher('quickexit', setupQuickexitDispatcher);

/**
 * 事件类型与处理器映射配置
 * @key 事件类型
 * @value 事件处理器配置
 */
const EVENT_HANDLERS = {
  keydown: {
    type: 'keydown' as const,
    target: window,
    validator: (e: Event) => (e as KeyboardEvent).code === 'Escape',
  },
  rightclick: {
    type: 'rightclick' as const,
    target: document,
    validator: (e: Event) => e.type === 'rightclick',
  },
} as const;

/**
 * 创建快速退出事件分发器
 * @param listener - 事件触发时的回调函数
 * @param opts - 事件监听配置参数
 * @returns 清理函数，用于移除事件监听
 */
function setupQuickexitDispatcher(
  listener: SetupDispatcherListener,
  opts: SetupDispatcherListenerOptions<{
    capture?: boolean;
    passive?: boolean;
    once?: boolean;
  }>,
) {
  /** 清理事件监听器 */
  function clean() {
    Object.values(EVENT_HANDLERS).forEach(({ type, target }) => {
      off(type, trigger, { ...opts, target });
    });
  }

  /**
   * 统一事件触发器
   * @param e - 事件对象
   */
  function trigger(e: Event) {
    const eventConfig = EVENT_HANDLERS[e.type as keyof typeof EVENT_HANDLERS];

    if (eventConfig?.validator(e)) {
      e.preventDefault();
      listener(e as PointerEvent);
    }
  }

  /** 初始化事件监听 */
  function setup() {
    Object.values(EVENT_HANDLERS).forEach(({ type, target }) => {
      on(type, trigger, { ...opts, target });
    });
    return clean;
  }

  return setup();
}
