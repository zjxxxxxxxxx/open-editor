import { jsx } from '../../jsx/jsx-runtime';
import { off, on } from '../event';
import { getOptions } from '../options';
import { appendChild } from './dom';
import { isTopWindow } from './topWindow';

// 事件类型常量（扩展性强于数组）
const OVERLAY_EVENTS = {
  BASE: ['pointerdown', 'pointerup', 'pointerout'],
  EXTENDED: ['pointermove'],
} as const;

// 缓存状态清理函数（SRP 原则）
let overlayTeardown: (() => void) | null = null;

/**
 * 事件隔离控制模块
 */
export const eventBlocker = {
  /**
   * 激活事件隔离层
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
   */
  deactivate() {
    overlayTeardown?.();
  },
};

/**
 * 创建隔离层 DOM 元素
 */
function createOverlay() {
  return jsx('div', {
    className: 'oe-event-blocker',
  });
}

/**
 * 事件监听器调度器
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
