import {
  type SetupDispatcherListener,
  type SetupDispatcherListenerOptions,
  createCustomEventDispatcher,
} from './create';
import { off, on } from '.';

/**
 * 创建长按事件分发器
 */
export default createCustomEventDispatcher('longpress', setupLongpressDispatcher);

/**
 * 初始化长按事件监听器
 * @param listener 事件监听回调函数
 * @param opts 配置选项
 */
function setupLongpressDispatcher(
  listener: SetupDispatcherListener,
  opts: SetupDispatcherListenerOptions<{
    /**
     * 长按触发等待时间（毫秒）
     * @default 300
     */
    wait?: number;
  }>,
) {
  // 使用默认等待时间300毫秒
  const { wait = 300 } = opts;
  let waitTimer: number | null = null;

  /**
   * 初始化事件监听
   */
  function setup() {
    // 绑定指针事件
    on('pointerdown', start, opts);
    on('pointermove', stop, opts);
    on('pointerup', stop, opts);
    on('pointercancel', stop, opts);

    return clean;
  }

  /**
   * 清理事件监听
   */
  function clean() {
    // 解绑所有指针事件
    off('pointerdown', start, opts);
    off('pointermove', stop, opts);
    off('pointerup', stop, opts);
    off('pointercancel', stop, opts);
  }

  /**
   * 处理指针按下事件
   * @param e 指针事件对象
   */
  function start(e: PointerEvent) {
    // 检测左键按下、触摸开始或笔接触
    if (e.button === 0 && e.buttons === 1) {
      waitTimer = setTimeout(() => {
        // 提供震动反馈提示用户进入可拖动状态，由于兼容性问题，此处不强制使用
        navigator.vibrate?.(15);
        listener(e);
      }, wait) as unknown as number;
    }
  }

  /**
   * 终止长按计时器
   */
  function stop() {
    if (waitTimer != null) {
      clearTimeout(waitTimer);
      waitTimer = null;
    }
  }

  return setup();
}
