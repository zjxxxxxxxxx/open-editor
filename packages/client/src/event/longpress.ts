import {
  type SetupDispatcherListener,
  type SetupDispatcherListenerOptions,
  createCustomEventDispatcher,
} from './create';
import { off, on } from '.';

/**
 * 创建长按手势事件分发器
 * @remarks
 * 本分发器封装了移动端长按交互的通用模式，支持跨平台指针事件处理，
 * 适用于触控设备和传统鼠标设备的自适应场景
 */
export default createCustomEventDispatcher('longpress', setupLongpressDispatcher);

/**
 * 初始化长按事件监听系统
 * @param listener - 事件触发时的回调处理器
 * @param opts - 配置选项集，包含长按阈值及事件绑定参数
 * @returns 返回事件监听器的卸载函数，用于资源回收
 *
 * @technicalDetails
 * 实现机制采用三级事件流控制：
 * 1. 指针按下时启动延迟触发器
 * 2. 指针移动/释放时取消触发
 * 3. 超时阈值到达后执行回调
 */
function setupLongpressDispatcher(
  listener: SetupDispatcherListener,
  opts: SetupDispatcherListenerOptions<{
    /**
     * 长按激活阈值（毫秒）
     * @defaultValue 300
     * @minimum 100 - 防止误触的最小合理值
     * @maximum 2000 - 避免响应迟钝的上限值
     */
    wait?: number;
  }>,
) {
  // 初始化计时器句柄（使用类型断言适配浏览器环境）
  let waitTimer: number | null = null;
  // 解构配置参数并设置默认值
  const { wait = 300 } = opts;

  /**
   * 安装事件监听器
   * @internal
   * 绑定流程：
   * 1. pointerdown - 启动长按计时
   * 2. pointermove - 中断可能的长按状态
   * 3. pointerup/cancel - 清理计时资源
   */
  function setup() {
    on('pointerdown', start, opts); // 捕获按压起始事件
    on('pointermove', stop, opts); // 追踪移动中断事件
    on('pointerup', stop, opts); // 捕获释放结束事件
    on('pointercancel', stop, opts); // 处理系统级中断事件

    return clean;
  }

  /**
   * 清理事件监听器
   * @internal
   * 执行反向解绑操作，确保内存安全：
   * - 移除所有关联的事件处理器
   * - 清理可能存在的计时器残留
   */
  function clean() {
    off('pointerdown', start, opts);
    off('pointermove', stop, opts);
    off('pointerup', stop, opts);
    off('pointercancel', stop, opts);
  }

  /**
   * 处理按压起始事件
   * @param e - 指针事件对象
   * @internal
   * 触发条件验证：
   * - 主按键操作（左键/触摸接触）
   * - 无其他并发按键状态
   */
  function start(e: PointerEvent) {
    if (e.button === 0 && e.buttons === 1) {
      waitTimer = setTimeout(() => {
        // 提供触觉反馈（兼容性检测避免异常）
        navigator.vibrate?.(15); // 短震动提示操作生效
        listener(e); // 执行上层业务回调
      }, wait) as unknown as number; // 适配浏览器与Node环境类型差异
    }
  }

  /**
   * 中止长按流程
   * @internal
   * 安全清理策略：
   * - 清除计时器引用
   * - 重置状态标识
   */
  function stop() {
    if (waitTimer != null) {
      clearTimeout(waitTimer);
      waitTimer = null;
    }
  }

  // 立即激活事件监听并返回清理入口
  return setup();
}
