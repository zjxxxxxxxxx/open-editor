import {
  type SetupDispatcherListener,
  type SetupDispatcherListenerOptions,
  createCustomEventDispatcher,
} from './create';
import { off, on } from '.';

/**
 * 快速退出事件分发器（集成 Escape 键与右击事件）
 */
export default createCustomEventDispatcher('quickexit', setupQuickexitDispatcher);

/**
 * 创建快速退出事件处理器
 */
function setupQuickexitDispatcher(
  listener: SetupDispatcherListener,
  opts: SetupDispatcherListenerOptions,
) {
  /**
   * 事件处理器配置表
   */
  const EVENT_HANDLERS = {
    keydown: {
      type: 'keydown' as const,
      target: window,
      // 标准键码检测
      validator: (e: Event) => (e as KeyboardEvent).code === 'Escape',
    },
    rightclick: {
      // 自定义事件类型 'rightclick'
      type: 'rightclick' as const,
      target: opts.target,
      // 统一右击抽象层
      validator: (e: Event) => e.type === 'rightclick',
    },
  } as const;

  /**
   * 事件监听初始化器
   */
  function setup() {
    Object.values(EVENT_HANDLERS).forEach(({ type, target }) => {
      on(type, trigger, { ...opts, target });
    });
    return clean;
  }

  /**
   * 统一清理器
   */
  function clean() {
    Object.values(EVENT_HANDLERS).forEach(({ type, target }) => {
      off(type, trigger, { ...opts, target });
    });
  }

  /**
   * 统一事件触发器（事件总线）
   *
   * @param e - 原始事件对象
   */
  function trigger(e: Event) {
    const eventConfig = EVENT_HANDLERS[e.type as keyof typeof EVENT_HANDLERS];

    // 双层校验保证事件合法性
    if (eventConfig?.validator(e)) {
      // 阻止系统默认菜单/导航
      e.preventDefault();
      // 统一转换为 PointerEvent
      listener(e as PointerEvent);
    }
  }

  return setup();
}
