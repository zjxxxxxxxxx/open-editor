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
 *
 * @implementation_rationale
 * 1. 键盘检测: 使用 keydown 而非 keyup 确保及时响应
 * 2. 右击检测: 采用自定义事件类型 'rightclick'
 * 3. 验证隔离: 每个事件类型独立验证逻辑，避免条件耦合
 */
function setupQuickexitDispatcher(
  listener: SetupDispatcherListener,
  opts: SetupDispatcherListenerOptions,
) {
  /**
   * 事件处理器配置表
   *
   * @field keydown   : Escape 键检测（跨浏览器键码兼容）
   * @field rightclick: 合成右击事件（包含触控设备长按场景）
   *
   * @event_flow
   * +----------------+     +-----------------+
   * |  Native Event  | --> |   Validator     |
   * +----------------+     +--------+--------+
   *                                 |
   *                         +-------v--------+
   *                         | Event Dispatch |
   *                         +----------------+
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
   *
   * @event_processing
   * 1. 类型路由: 根据 event.type 选择处理器配置
   * 2. 语义验证: 执行类型专属校验逻辑
   * 3. 行为控制: 阻止默认行为并派发业务事件
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
