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
 * 监听器配置接口
 * 功能：定义检查器生命周期回调方法
 */
export interface SetupListenersOptions {
  /** 当元素激活时的回调（用于更新视图） */
  onActive: () => void;
  /** 打开元素树时的回调（需要跨框架通信时使用） */
  onOpenTree: (el: HTMLElement) => void;
  /** 打开编辑器时的回调（需要DOM操作时使用） */
  onOpenEditor: (el: HTMLElement) => void;
  /** 退出检查模式时的清理回调 */
  onExitInspect: () => void;
}

/**
 * 静默事件列表
 * 作用：阻止这些事件的默认行为和冒泡，确保检查器操作不被干扰
 */
const SILENT_EVENTS = // 鼠标事件（修正重复项后共7个）
  (
    'mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,' +
    // 触摸事件（4个）
    'touchstart,touchend,touchcancel,touchmove,' +
    // 指针事件（8个）
    'pointercancel,pointerdown,pointerenter,pointerleave,pointermove,pointerout,pointerover,pointerup,' +
    // 拖拽事件（7个）
    'drag,dragend,dragenter,dragleave,dragover,dragstart,drop,' +
    // 表单事件（为7个）
    'focus,blur,reset,submit,input,change,select,' +
    // 特殊事件（1个）
    'dblclick'
  ).split(',');

/**
 * 点击关联事件白名单
 * 特殊处理：在Safari中阻止这些事件的默认行为会导致点击失效
 */
const CLICK_ATTACHMENT_EVENTS = new Set(['touchstart', 'touchend']);

/**
 * 快捷键列表
 * 作用：触发快速操作的键盘按键
 */
const SHORTCUT_KEYS = new Set(['Enter', 'Space']);

/**
 * 初始化全局事件监听系统
 * 核心功能：
 * 1. 注册/注销事件监听器
 * 2. 管理检查器状态
 * 3. 处理跨框架通信
 *
 * @param opts 生命周期回调配置
 * @returns 用于注销监听器的函数
 */
export function setupListeners(opts: SetupListenersOptions) {
  const { once, crossIframe } = getOptions();

  // 包装回调确保清理操作
  const wrappedCallbacks = {
    onActive: wrapWithCleanup(opts.onActive),
    onOpenTree: wrapWithCleanup(opts.onOpenTree),
    onOpenEditor: wrapWithCleanup(opts.onOpenEditor),
    onExitInspect: wrapWithCleanup(opts.onExitInspect),
  };

  // 核心事件配置
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

  // 事件管理控制器
  const eventController = {
    register: () => manageListeners(on),
    unregister: () => manageListeners(off),
  };

  eventController.register();
  return eventController.unregister;

  /** 事件管理策略实现 */
  function manageListeners(operation: typeof on | typeof off) {
    // 系统级静默事件
    SILENT_EVENTS.forEach((event) => operation(event, handleSilentEvent, { capture: true }));

    // 业务逻辑事件
    coreHandlers.forEach(({ type, handler, target }) =>
      operation(type, handler, {
        target,
        capture: true,
      }),
    );
  }

  /** 处理活动元素变化 */
  function handleActiveElement(e: PointerEvent) {
    if (!shouldProcessEvent()) return;

    const targetEl = getValidElement(e);
    if (targetEl !== inspectorState.activeEl) {
      inspectorState.activeEl = targetEl;
      wrappedCallbacks.onActive();
    }
  }

  /** 获取有效目标元素 */
  function getValidElement(e: PointerEvent) {
    const element = (
      e.pointerType === 'touch' ? document.elementFromPoint(e.clientX, e.clientY) : e.target
    ) as HTMLElement;

    return checkValidElement(element) ? element : null;
  }

  /** 事件处理条件校验 */
  function shouldProcessEvent() {
    return inspectorState.isEnable && !inspectorState.isTreeOpen;
  }

  /** 处理触摸屏进入事件 */
  function handleEnterScreen(e: PointerEvent) {
    if (e.pointerType === 'touch') {
      handleActiveElement(e); // 移动端首次触摸时获取焦点
    }
  }

  /** 处理离开屏幕事件 */
  function handleLeaveScreen(e: PointerEvent) {
    if (crossIframe && !isTopWindow) return;

    if (e.pointerType === 'mouse' && !e.relatedTarget) {
      inspectorState.activeEl = null;
      wrappedCallbacks.onActive();
    }
  }

  /** 处理键盘事件 */
  function handleKeyDown(e: KeyboardEvent) {
    if (!inspectorState.activeEl || !SHORTCUT_KEYS.has(e.code)) return;

    modifyEventProperties(e, {
      type: () => `key${e.code}`.toLowerCase(),
      target: () => inspectorState.activeEl,
    });

    setupClickedElementAttrs(e);
    handleInspect(e as unknown as PointerEvent);
  }

  /** 处理按键释放 */
  function handleKeyUp(e: KeyboardEvent) {
    if (SHORTCUT_KEYS.has(e.code)) {
      cleanClickedElementAttrs();
    }
  }

  /** 元素检查主逻辑 */
  function handleInspect(e: PointerEvent) {
    handleSilentEvent(e);

    const targetEl = e.target as HTMLElement;
    if (!checkClickedElement(targetEl)) return;

    const finalEl = getFinalElement(targetEl);
    inspectorState.activeEl = null;

    if (once) wrappedCallbacks.onExitInspect();
    triggerCallback(e, finalEl);
  }

  /** 确定最终目标元素 */
  function getFinalElement(fallback: HTMLElement) {
    return inspectorState.activeEl?.isConnected ? inspectorState.activeEl : fallback;
  }

  /** 触发对应回调方法 */
  function triggerCallback(e: PointerEvent, el: HTMLElement) {
    const isTreeOp = e.metaKey || e.type === 'longpress';
    const callback = isTreeOp ? wrappedCallbacks.onOpenTree : wrappedCallbacks.onOpenEditor;
    callback(el);
  }
}

/**
 * 事件属性修改器
 * 作用：动态修改事件对象属性
 * 注意：可能影响事件传播链，谨慎使用
 */
function modifyEventProperties(e: Event, properties: Record<string, () => any>) {
  Object.entries(properties).forEach(([prop, getter]) => {
    Object.defineProperty(e, prop, { get: getter });
  });
}

/**
 * 静默事件处理器
 * 功能：阻止事件传播和默认行为
 * 特殊处理：Safari的触摸事件不阻止默认行为
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
 * 回调包装器
 * 功能：确保执行回调前清理元素属性
 */
function wrapWithCleanup<T extends (...args: any[]) => any>(
  fn: T,
): (...args: Parameters<T>) => ReturnType<T> {
  return function wrapped(...args: Parameters<T>): ReturnType<T> {
    cleanClickedElementAttrs();
    return fn(...args);
  };
}
