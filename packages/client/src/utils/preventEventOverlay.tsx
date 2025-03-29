import { off, on } from '../event';
import { getOptions } from '../options';
import { appendChild } from './dom';
import { isTopWindow } from './topWindow';

// 事件处理器缓存
let cleanupHandler: (() => void) | null = null;

// 事件类型集合（减少魔法字符串使用）
const POINTER_EVENTS = ['pointerdown', 'pointerup', 'pointerout'] as const;
const TOP_WINDOW_EVENTS = ['pointermove'] as const;

/**
 * 事件阻止覆盖层模块
 * 功能：在页面顶层创建透明遮罩层，通过监听指针事件自动卸载自身
 * 应用场景：防止模态框底层元素的事件穿透
 */
export const preventEventOverlay = {
  /**
   * 挂载事件阻止层
   * 逻辑流程：
   * 1. 检查是否已有实例存在（防止重复挂载）
   * 2. 创建覆盖层DOM元素
   * 3. 初始化事件监听
   * 4. 插入DOM树
   */
  mount() {
    if (cleanupHandler) return;

    const { once } = getOptions();
    const overlay = <div className="oe-prevent-event-overlay" />;
    const target = once ? overlay : window;

    // 初始化事件处理器（参考网页86事件监听参数匹配原则）
    function initEventHandlers() {
      manageEventListeners(on);
    }

    // 定义统一清理逻辑
    function executeCleanup() {
      if (!cleanupHandler) return;

      // 移除所有事件监听
      manageEventListeners(off);

      // 移除DOM元素并重置缓存
      overlay.remove();
      cleanupHandler = null;
    }

    /**
     * 管理事件监听器的统一入口
     */
    function manageEventListeners(operationType: typeof on | typeof off) {
      // 第一步：处理基础指针事件（兼容所有环境）
      POINTER_EVENTS.forEach((eventType) => {
        // 使用统一配置：捕获阶段监听 + 指定事件目标
        operationType(eventType, executeCleanup, {
          target,
          capture: true,
        });
      });

      // 第二步：仅在顶层窗口注册额外事件（防止iframe重复监听）
      if (isTopWindow) {
        TOP_WINDOW_EVENTS.forEach((eventType) => {
          operationType(eventType, executeCleanup, {
            target,
            capture: true,
          });
        });
      }
    }

    cleanupHandler = executeCleanup;
    initEventHandlers();
    appendChild(document.body, overlay);
  },

  /**
   * 主动卸载事件阻止层
   * 安全机制：双重空值检查确保安全调用
   */
  unmount() {
    cleanupHandler?.();
  },
};
