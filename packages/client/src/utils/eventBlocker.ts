import { off, on } from '../event';
import { getOptions } from '../options';
import { appendChild } from './dom';
import { isTopWindow } from './topWindow';

// 状态管理模块（SRP原则）
type EventHandler = () => void;
let overlayTeardown: EventHandler | null = null;

// 事件类型常量（扩展性强于数组）
const OVERLAY_EVENTS = {
  BASE: ['pointerdown', 'pointerup', 'pointerout'],
  EXTENDED: ['pointermove'],
} as const;

// 样式常量（避免硬编码）
const OVERLAY_CLASS = 'oe-event-blocker';

/**
 * 事件隔离控制模块
 * 设计目标：通过透明覆盖层实现事件隔离，避免底层元素意外交互
 * 核心机制：利用事件捕获机制优先处理覆盖层事件
 */
export const eventBlocker = {
  /**
   * 激活事件隔离层
   * 设计决策：
   * 1. 使用PointerEvent统一处理各类输入设备（触控/鼠标/触控笔）
   * 2. 分层事件处理：基础事件集 + 扩展事件集（仅顶层窗口需要）
   * 3. 自动清理机制确保资源释放
   */
  activate() {
    if (overlayTeardown) return;

    const { once } = getOptions();
    const overlay = createOverlay();
    const eventTarget = once ? overlay : window;

    // 事件管理器（策略模式）
    const eventController = {
      add: () => manageListeners(on, performTeardown, eventTarget),
      remove: () => manageListeners(off, performTeardown, eventTarget),
    };

    // 组合式清理逻辑（命令模式）
    function performTeardown() {
      if (!overlayTeardown) return;

      eventController.remove();
      overlay.remove();
      overlayTeardown = null;
    }

    overlayTeardown = performTeardown;
    eventController.add();
    appendChild(document.body, overlay);
  },

  /**
   * 解除事件隔离层
   * 安全机制：
   * - 幂等操作（多次调用无副作用）
   * - 同步清理避免内存泄漏
   */
  deactivate() {
    overlayTeardown?.();
  },
};

/**
 * 创建隔离层DOM元素
 * 技术规范：
 * - 全屏覆盖（需搭配CSS样式实现）
 * - 透明背景避免视觉干扰
 * - 高z-index确保顶层覆盖
 */
function createOverlay() {
  const element = document.createElement('div');
  element.className = OVERLAY_CLASS;
  return element;
}

/**
 * 事件监听器调度器
 * 实现细节：
 * - 捕获阶段处理确保优先响应
 * - 动态判断顶层窗口避免重复监听（如iframe场景）
 * 参考文档：
 */
function manageListeners(
  operation: typeof on | typeof off,
  callback: () => void,
  target: Window | HTMLElement,
) {
  // 基础事件集（所有环境必需）
  OVERLAY_EVENTS.BASE.forEach((event) =>
    operation(event, callback, {
      target,
      capture: true,
    }),
  );

  // 扩展事件集（仅顶层窗口需要）
  if (isTopWindow) {
    OVERLAY_EVENTS.EXTENDED.forEach((event) =>
      operation(event, callback, {
        target,
        capture: true,
      }),
    );
  }
}
