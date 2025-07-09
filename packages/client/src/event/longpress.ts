import {
  type SetupDispatcherListener,
  type SetupDispatcherListenerOptions,
  createCustomEventDispatcher,
} from './create';
import { off, on } from '.';

/**
 * 创建长按手势事件分发器
 */
export default createCustomEventDispatcher('longpress', setupLongpressDispatcher);

/**
 * 初始化长按事件处理系统
 * @param listener - 事件触发回调函数，接收原始指针事件
 * @param opts - 配置选项集
 * @returns 返回事件监听器的卸载函数，用于安全释放资源
 */
function setupLongpressDispatcher(
  listener: SetupDispatcherListener,
  opts: SetupDispatcherListenerOptions<{
    /**
     * 长按激活时间阈值配置
     */
    wait?: number;
  }>,
) {
  // 中断事件类型集合（使用常量提升可维护性）
  const STOP_EVENTS = [
    // 检测滑动操作（未来可配置容差阈值）
    'pointermove',
    // 正常释放终止
    'pointerup',
    // 系统级中断（如来电）
    'pointercancel',
  ];

  // 配置解构与校验
  const { wait = 300 } = opts;

  // 计时器句柄
  let waitTimer: number | null = null;

  /**
   * 初始化事件监听系统
   *
   * | 事件类型      | 绑定阶段 | 解绑阶段 | 作用域       |
   * |--------------|----------|----------|-------------|
   * | pointerdown  | √        | √        | 文档级别     |
   * | 中断事件      | √        | √        | 文档级别     |
   */
  function setup() {
    on('pointerdown', start, opts);
    STOP_EVENTS.forEach((type) => on(type, stop, opts));
    return clean;
  }

  /** 资源清理器（遵循 RAII 原则） */
  function clean() {
    off('pointerdown', start, opts);
    STOP_EVENTS.forEach((type) => off(type, stop, opts));
    // 确保清理残留计时器
    stop();
  }

  /**
   * 处理按压起始事件
   * @param e - 指针事件对象
   * @see https://w3c.github.io/pointerevents/#the-button-property
   *
   * | 设备类型     | button | buttons |
   * |-------------|--------|---------|
   * | 鼠标左键     | 0      | 1       |
   * | 触控输入     | 0      | 1       |
   * | 笔式设备     | 0      | 1       |
   */
  function start(e: PointerEvent) {
    if (e.button === 0 && e.buttons === 1) {
      waitTimer = window.setTimeout(() => {
        // 提供多模态反馈（未来可配置化）
        navigator.vibrate?.(15);
        listener(e);
      }, wait);
    }
  }

  /** 安全终止执行流（幂等操作） */
  function stop() {
    if (waitTimer != null) {
      clearTimeout(waitTimer);
      waitTimer = null;
    }
  }

  // 立即生效并返回清理入口
  return setup();
}
