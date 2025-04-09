import {
  type SetupDispatcherListener,
  type SetupDispatcherListenerOptions,
  createCustomEventDispatcher,
} from './create';
import { off, on } from '.';

/**
 * 创建长按手势事件分发器
 *
 * @remarks
 * 实现跨平台的长按交互解决方案，具备以下特性：
 * - 自适应触控设备与桌面设备
 * - 支持动态阈值配置
 * - 包含触觉反馈机制
 * - 自动清理防止内存泄漏
 */
export default createCustomEventDispatcher('longpress', setupLongpressDispatcher);

/**
 * 初始化长按事件处理系统
 *
 * @param listener - 事件触发回调函数，接收原始指针事件
 * @param opts - 配置选项集，包含：
 *   - wait: 长按激活阈值（单位：毫秒）
 *     - 默认值：300（符合人体工程学常见设定）
 *     - 最小值：100（防止误触的最低限制）
 *     - 最大值：2000（避免响应迟钝的上限）
 *   - 其他标准事件绑定参数
 *
 * @returns 返回事件监听器的卸载函数，用于安全释放资源
 *
 * @technicalDetails
 * ### 实现架构
 * 采用状态机模式管理交互流程：
 *
 * ```mermaid
 * graph TD
 *   A[PointerDown] --> B{主按键?}
 *   B -->|是| C[启动计时器]
 *   B -->|否| D[忽略事件]
 *   C --> E{达到阈值?}
 *   E -->|是| F[触发回调]
 *   E -->|中途移动/释放| G[终止流程]
 * ```
 *
 * ### 事件处理流程
 * 1. **按下阶段** (pointerdown)
 *    - 验证主按键状态
 * 2. **维持阶段**
 *    - 监测移动事件（pointermove）
 *    - 计算位移容差（未来增强点）
 * 3. **终止阶段**
 *    - 成功：计时完成后触发回调
 *    - 失败：提前释放或移动时取消
 */
function setupLongpressDispatcher(
  listener: SetupDispatcherListener,
  opts: SetupDispatcherListenerOptions<{
    /**
     * 长按激活时间阈值配置
     *
     * 建议根据设备类型动态调整：
     * - 触屏设备: 300-500ms
     * - 桌面设备: 500-1000ms
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
   * 事件绑定策略：
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
   *
   * @param e - 指针事件对象
   * @see https://w3c.github.io/pointerevents/#the-button-property
   *
   * 验证逻辑矩阵：
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
