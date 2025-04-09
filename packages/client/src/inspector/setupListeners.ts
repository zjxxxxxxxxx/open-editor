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
 *
 * @remarks
 * 提供检查器不同阶段的回调方法，用于实现跨框架通信和状态更新
 */
export interface SetupListenersOptions {
  /**
   * 元素激活回调
   *
   * @param el - 当前激活的 DOM 元素（null 表示无激活元素）
   */
  onActiveElement: (el: HTMLElement | null) => void;
  /**
   * 打开组件树回调
   *
   * @param el - 需要展示在元素树中的根元素
   */
  onOpenTree: (el: HTMLElement) => void;
  /**
   * 打开编辑器回调
   *
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
 *
 * @remarks
 * 阻止这些事件的默认行为和冒泡，避免影响检查器操作：
 * - 覆盖鼠标/触摸/指针/拖拽/表单等 6 大类事件
 * - 特殊处理 Safari 的 touch 事件防止点击失效
 */
const SILENT_EVENTS = // 鼠标事件（7个）
  (
    'mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,' +
    // 触摸事件（4个）
    'touchstart,touchend,touchcancel,touchmove,' +
    // 指针事件（8个）
    'pointercancel,pointerdown,pointerenter,pointerleave,pointermove,pointerout,pointerover,pointerup,' +
    // 拖拽事件（7个）
    'drag,dragend,dragenter,dragleave,dragover,dragstart,drop,' +
    // 表单事件（7个）
    'focus,blur,reset,submit,input,change,select,' +
    // 特殊事件（1个）
    'dblclick'
  ).split(',');

/**
 * 点击关联事件白名单
 *
 * @remarks
 * Safari 特殊处理：阻止这些事件的默认行为会导致点击失效
 */
const CLICK_ATTACHMENT_EVENTS = new Set(['touchstart', 'touchend']);

/**
 * 快捷键映射表
 *
 * @remarks
 * 支持通过键盘快速触发操作的按键集合
 */
const SHORTCUT_KEYS = new Set(['Enter', 'Space']);

/**
 * 初始化全局事件监听系统
 *
 * @param opts - 生命周期回调配置
 *
 * @returns 解除监听的清理函数
 *
 * @remarks
 * 核心功能：
 * 1. 实现跨框架的事件通信机制
 * 2. 管理检查器状态机（激活/禁用/元素树模式）
 * 3. 处理用户交互与视图更新的协同
 */
export function setupListeners(opts: SetupListenersOptions) {
  const { once, crossIframe } = getOptions();

  // 封装带清理操作的回调函数
  const wrappedCallbacks = {
    onActiveElement: wrapWithCleanup(opts.onActiveElement),
    onOpenTree: wrapWithCleanup(opts.onOpenTree),
    onOpenEditor: wrapWithCleanup(opts.onOpenEditor),
    onExitInspect: wrapWithCleanup(opts.onExitInspect),
  };

  /**
   * 核心事件处理器配置
   *
   * @remarks
   * 每个配置项包含：
   * - type: 监听的事件类型
   * - handler: 事件处理函数
   * - target: 事件监听目标（默认为 document）
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

  // 事件控制器（注册/注销方法）
  const eventController = {
    register: () => manageListeners(on),
    unregister: () => manageListeners(off),
  };

  eventController.register();
  return eventController.unregister;

  /**
   * 事件监听管理器
   *
   * @param operation - 监听操作函数（on/off）
   */
  function manageListeners(operation: typeof on | typeof off) {
    // 注册静默事件处理器（捕获阶段处理）
    SILENT_EVENTS.forEach((event) => operation(event, handleSilentEvent, { capture: true }));

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
   *
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
   * 获取有效 DOM 元素
   *
   * @param e - 指针事件对象
   *
   * @returns 通过校验的 HTMLElement 或 null
   */
  function getValidElement(e: PointerEvent) {
    const element = (
      e.pointerType === 'touch' ? document.elementFromPoint(e.clientX, e.clientY) : e.target
    ) as HTMLElement;

    return checkValidElement(element) ? element : null;
  }

  /** 判断是否处理事件的通用条件 */
  function shouldProcessEvent() {
    return inspectorState.isEnable && !inspectorState.isTreeOpen;
  }

  /**
   * 处理触摸屏进入事件
   *
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
   *
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
   *
   * @param e - 键盘事件对象
   */
  function handleKeyDown(e: KeyboardEvent) {
    if (!inspectorState.activeEl || !SHORTCUT_KEYS.has(e.code)) return;

    // 动态修改事件属性以统一处理逻辑
    modifyEventProperties(e, {
      type: () => `key${e.code}`.toLowerCase(),
      target: () => inspectorState.activeEl,
    });

    setupClickedElementAttrs(e);
    handleInspect(e as unknown as PointerEvent);
  }

  /**
   * 处理按键释放事件
   *
   * @param e - 键盘事件对象
   */
  function handleKeyUp(e: KeyboardEvent) {
    if (SHORTCUT_KEYS.has(e.code)) {
      // 清理临时属性
      cleanClickedElementAttrs();
    }
  }

  /**
   * 元素检查主逻辑
   *
   * @param e - 指针事件对象
   */
  function handleInspect(e: PointerEvent) {
    handleSilentEvent(e);

    const targetEl = e.target as HTMLElement;
    if (!checkClickedElement(targetEl)) return;

    const finalEl = getFinalElement(targetEl);
    // 重置激活状态
    inspectorState.activeEl = null;

    // 单次模式自动退出
    if (once) wrappedCallbacks.onExitInspect();
    triggerCallback(e, finalEl);
  }

  /**
   * 确定最终目标元素
   *
   * @param fallback - 备选元素
   *
   * @returns 优先返回已激活的有效元素
   */
  function getFinalElement(fallback: HTMLElement) {
    return inspectorState.activeEl?.isConnected ? inspectorState.activeEl : fallback;
  }

  /**
   * 触发对应回调方法
   *
   * @param e - 事件对象
   * @param el - 目标元素
   */
  function triggerCallback(e: PointerEvent, el: HTMLElement) {
    const isTreeOp = e.metaKey || e.type === 'longpress';
    const callback = isTreeOp ? wrappedCallbacks.onOpenTree : wrappedCallbacks.onOpenEditor;
    callback(el);
  }
}

/**
 * 动态修改事件属性
 *
 * @remarks
 * 用于统一处理键盘事件到指针事件的转换
 *
 * @param e - 事件对象
 * @param properties - 需要修改的属性映射表
 */
function modifyEventProperties(e: Event, properties: Record<string, () => any>) {
  Object.entries(properties).forEach(([prop, getter]) => {
    Object.defineProperty(e, prop, { get: getter });
  });
}

/**
 * 静默事件处理器
 * @remarks
 * 阻止事件传播和默认行为，但需注意：
 * - 在 Safari 中阻止 touch 事件默认行为会导致点击失效
 *
 * @param e - 事件对象
 */
function handleSilentEvent(e: Event) {
  const isValidTarget = [e.target, (e as any).relatedTarget].some((el) => checkValidElement(el));

  if (isValidTarget) {
    const shouldPreventDefault = !CLICK_ATTACHMENT_EVENTS.has(e.type);
    if (shouldPreventDefault) e.preventDefault();
    e.stopPropagation();
  }
}

/**
 * 回调包装器（带清理功能）
 *
 * @param fn - 原始回调函数
 *
 * @returns 封装后的安全回调
 *
 * @remarks
 * 确保执行回调前清理元素临时属性
 */
function wrapWithCleanup<T extends (...args: any[]) => any>(
  fn: T,
): (...args: Parameters<T>) => ReturnType<T> {
  return function wrapped(...args: Parameters<T>): ReturnType<T> {
    // 统一清理临时属性
    cleanClickedElementAttrs();
    return fn(...args);
  };
}
