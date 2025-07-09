import { checkValidElement } from '../utils/checkElement';
import { isTopWindow } from '../utils/topWindow';
import { getOptions } from '../options';
import { off, on } from '../event';
import {
  checkClickedElement,
  setupClickedElementAttrs,
  cleanClickedElementAttrs,
} from './clickedElement';
import { inspectorState } from './inspectorState';

/**
 * 监听器生命周期回调配置接口
 * @remarks 提供检查器不同阶段的回调方法，用于实现跨框架通信和状态更新
 */
export interface SetupListenersOptions {
  /**
   * 元素激活回调
   * @param el - 当前激活的 DOM 元素（null 表示无激活元素）
   */
  onActiveElement: (el: HTMLElement | null) => void;
  /**
   * 打开组件树回调
   * @param el - 需要展示在元素树中的根元素
   */
  onOpenTree: (el: HTMLElement) => void;
  /**
   * 打开编辑器回调
   * @param el - 需要编辑的目标元素
   */
  onOpenEditor: (el: HTMLElement) => void;
  /**
   * 退出检查模式时的清理回调
   */
  onExitInspect: () => void;
}

/**
 * 需要静默处理的事件列表
 * @remarks 阻止这些事件的默认行为和冒泡，避免影响检查器操作
 */
const SILENT_EVENTS = (
  'mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,' +
  'touchstart,touchend,touchcancel,touchmove,' +
  'pointercancel,pointerdown,pointerenter,pointerleave,pointermove,pointerout,pointerover,pointerup,' +
  'drag,dragend,dragenter,dragleave,dragover,dragstart,drop,' +
  'focus,blur,reset,submit,input,change,select,' +
  'dblclick'
).split(',');

/**
 * 点击关联事件白名单
 */
const CLICK_ATTACHMENT_EVENTS = new Set(['touchstart', 'touchend']);

/**
 * 快捷键映射表
 * @remarks 支持通过键盘快速触发操作的按键集合
 */
const SHORTCUT_KEYS = new Set(['Enter', 'Space']);

/**
 * 初始化全局事件监听系统
 * @param opts - 生命周期回调配置
 * @returns 解除监听的清理函数
 */
export function setupListeners(opts: SetupListenersOptions) {
  const { once, crossIframe } = getOptions();

  // 使用包装器包装所有回调，保证在执行前统一清理临时属性
  const wrappedCallbacks = {
    onActiveElement: wrapCallbackWithCleanup(opts.onActiveElement),
    onOpenTree: wrapCallbackWithCleanup(opts.onOpenTree),
    onOpenEditor: wrapCallbackWithCleanup(opts.onOpenEditor),
    onExitInspect: wrapCallbackWithCleanup(opts.onExitInspect),
  };

  /**
   * 核心事件处理器配置
   */
  const coreHandlers = [
    { type: 'click', handler: handleInspect, target: document },
    { type: 'pointerdown', handler: setupClickedElementAttrs },
    { type: 'pointermove', handler: handleActiveElement },
    { type: 'pointerover', handler: handleEnterScreen },
    { type: 'pointerout', handler: handleLeaveScreen },
    { type: 'longpress', handler: handleInspect },
    { type: 'quickexit', handler: wrappedCallbacks.onExitInspect },
    { type: 'keydown', handler: handleKeyDown },
    { type: 'keyup', handler: handleKeyUp },
  ];

  // 事件控制器，用于注册和注销监听器
  const eventController = {
    register: () => manageListeners(on),
    unregister: () => manageListeners(off),
  };

  eventController.register();
  return eventController.unregister;

  /**
   * 事件监听管理器
   * @param operation - 监听操作函数（on/off）
   */
  function manageListeners(operation: typeof on | typeof off) {
    // 注册所有静默事件处理器（捕获阶段）
    SILENT_EVENTS.forEach((event) => operation(event, processSilentEvent, { capture: true }));

    // 注册核心业务事件处理器
    coreHandlers.forEach(({ type, handler, target }) =>
      operation(type, handler, {
        target,
        capture: true,
      }),
    );
  }

  /**
   * 处理活动元素变化
   * @param e - 指针事件对象
   */
  function handleActiveElement(e: PointerEvent) {
    if (!shouldProcessEvent()) return;

    const targetEl = getValidElement(e);
    if (targetEl !== inspectorState.activeEl) {
      inspectorState.activeEl = targetEl;
      wrappedCallbacks.onActiveElement(targetEl);
    }
  }

  /**
   * 获取经过校验的 DOM 元素
   * @param e - 指针事件对象
   * @returns 通过校验的 HTMLElement 或 null
   */
  function getValidElement(e: PointerEvent) {
    const element = (
      e.pointerType === 'touch' ? document.elementFromPoint(e.clientX, e.clientY) : e.target
    ) as HTMLElement;
    return checkValidElement(element) ? element : null;
  }

  /** 判断是否满足处理事件的条件 */
  function shouldProcessEvent() {
    return inspectorState.isEnable && !inspectorState.isTreeOpen;
  }

  /**
   * 处理触摸屏进入（指针进入屏幕）事件
   * @param e - 指针事件对象
   */
  function handleEnterScreen(e: PointerEvent) {
    if (e.pointerType === 'touch') {
      // 移动端首次触摸时主动触发激活
      handleActiveElement(e);
    }
  }

  /**
   * 处理离开屏幕事件
   * @param e - 指针事件对象
   */
  function handleLeaveScreen(e: PointerEvent) {
    if (crossIframe && !isTopWindow) return;
    // 仅处理鼠标离开视口的情况
    if (e.pointerType === 'mouse' && !e.relatedTarget) {
      inspectorState.activeEl = null;
      wrappedCallbacks.onActiveElement(null);
    }
  }

  /**
   * 处理键盘按下事件
   * @param e - 键盘事件对象
   */
  function handleKeyDown(e: KeyboardEvent) {
    if (!inspectorState.activeEl || !SHORTCUT_KEYS.has(e.code)) return;
    // 动态修改事件属性，以便统一转换为指针事件处理逻辑
    overrideEventProperties(e, {
      type: () => `key${e.code}`.toLowerCase(),
      target: () => inspectorState.activeEl,
    });

    setupClickedElementAttrs(e);
    handleInspect(e as unknown as PointerEvent);
  }

  /**
   * 处理键盘释放事件
   * @param e - 键盘事件对象
   */
  function handleKeyUp(e: KeyboardEvent) {
    if (SHORTCUT_KEYS.has(e.code)) {
      // 清理临时属性
      cleanClickedElementAttrs();
    }
  }

  /**
   * 元素检查处理逻辑
   * @param e - 指针事件对象
   */
  function handleInspect(e: PointerEvent) {
    processSilentEvent(e);

    const targetEl = e.target as HTMLElement;
    if (!checkClickedElement(targetEl)) return;

    const finalEl = getFinalElement(targetEl);
    // 重置激活状态
    inspectorState.activeEl = null;
    // 单次模式下自动退出检查
    if (once) wrappedCallbacks.onExitInspect();
    triggerOpenHandler(e, finalEl);
  }

  /**
   * 获取最终确定的目标元素
   * @param fallback - 备用元素
   * @returns 若 inspectorState.activeEl 可用则返回之，否则返回 fallback
   */
  function getFinalElement(fallback: HTMLElement) {
    return inspectorState.activeEl?.isConnected ? inspectorState.activeEl : fallback;
  }

  /**
   * 触发打开回调处理
   * @param e - 事件对象
   * @param el - 目标元素
   */
  function triggerOpenHandler(e: PointerEvent, el: HTMLElement) {
    const isTreeOpen = e.metaKey || e.type === 'longpress';
    if (isTreeOpen) {
      wrappedCallbacks.onOpenTree(el);
    } else {
      wrappedCallbacks.onOpenEditor(el);
    }
  }
}

/**
 * 重写事件属性的工具函数
 * @remarks 用于将键盘事件转换为指针事件样式
 * @param e - 事件对象
 * @param properties - 属性映射表，指定需要重写的属性及其 getter
 */
function overrideEventProperties(e: Event, properties: Record<string, () => any>) {
  Object.entries(properties).forEach(([prop, getter]) => {
    Object.defineProperty(e, prop, { get: getter });
  });
}

/**
 * 静默事件处理器
 * @remarks 阻止事件的默认行为与冒泡，但注意 Safari 下部分事件需保留默认行为
 * @param e - 事件对象
 */
function processSilentEvent(e: Event) {
  const isValidTarget = [e.target, (e as any).relatedTarget].some((el) => checkValidElement(el));
  if (isValidTarget) {
    const shouldPreventDefault = !CLICK_ATTACHMENT_EVENTS.has(e.type);
    if (shouldPreventDefault) e.preventDefault();
    e.stopPropagation();
  }
}

/**
 * 回调包装器（带清理功能）
 * @param fn - 原始回调函数
 * @returns 包装后的回调函数，执行前会清理临时属性
 */
function wrapCallbackWithCleanup<T extends (...args: any[]) => any>(fn: T) {
  return function wrapped(...args: Parameters<T>): ReturnType<T> {
    cleanClickedElementAttrs();
    return fn(...args);
  };
}
