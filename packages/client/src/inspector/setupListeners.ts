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

// 配置项接口：定义监听器生命周期回调
export interface SetupListenersOptions {
  /** 元素激活时触发的渲染回调 */
  onActive: () => void;
  /** 打开元素树时触发的桥接事件 */
  onOpenTree: (el: HTMLElement) => void;
  /** 打开编辑器时触发的桥接事件 */
  onOpenEditor: (el: HTMLElement) => void;
  /** 退出检查模式时触发的桥接事件 */
  onExitInspect: () => void;
}

/**
 * 需要阻止默认行为的事件列表
 * 原理：
 * - 阻止这些事件的默认行为和冒泡，避免与检查器操作产生冲突
 * - 包含鼠标、触摸、指针、拖拽、表单等各类交互事件
 */
const SILENT_EVENTS = [
  // 鼠标事件
  'mousedown',
  'mouseenter',
  'mouseleave',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  // 触摸事件
  'touchstart',
  'touchend',
  'touchcancel',
  'touchmove',
  // 指针事件
  'pointercancel',
  'pointerdown',
  'pointerenter',
  'pointerleave',
  'pointermove',
  'pointerout',
  'pointerover',
  'pointerup',
  // 拖拽事件
  'drag',
  'dragend',
  'dragenter',
  'dragleave',
  'dragover',
  'dragstart',
  'drop',
  // 表单事件
  'focus',
  'focusin',
  'focusout',
  'blur',
  'reset',
  'submit',
  'input',
  'change',
  'select',
  // 其他事件
  'dbclick',
];

/**
 * 点击相关事件白名单
 * 说明：Safari浏览器中阻止touchstart/touchend的默认行为会导致点击事件失效
 */
const CLICK_ATTACHMENT_EVENTS = ['touchstart', 'touchend'];

/**
 * 快捷操作按键列表
 * 功能：用于触发快速交互的键盘按键
 */
const SHORTCUT_KEYS = ['Enter', 'Space'];

/**
 * 初始化事件监听系统
 * 核心逻辑：
 * 1. 注册全局事件监听器
 * 2. 管理检查器状态
 * 3. 处理跨iframe场景
 */
export function setupListeners(opts: SetupListenersOptions) {
  const { once, crossIframe } = getOptions();

  // 包装回调函数：执行前清理点击元素属性
  const onActive = withEventWrapper(opts.onActive);
  const onOpenEditor = withEventWrapper(opts.onOpenEditor);
  const onOpenTree = withEventWrapper(opts.onOpenTree);
  const onExitInspect = withEventWrapper(opts.onExitInspect);

  // 核心交互事件
  const events = [
    { type: 'click', handler: handleInspect, target: document },
    { type: 'pointerdown', handler: setupClickedElementAttrs },
    { type: 'pointermove', handler: handleActiveElement },
    { type: 'pointerover', handler: handleEnterScreen },
    { type: 'pointerout', handler: handleLeaveScreen },
    { type: 'longpress', handler: handleInspect },
    { type: 'quickexit', handler: onExitInspect },
    { type: 'keydown', handler: handleKeyDown },
    { type: 'keyup', handler: handleKeyUp },
  ];

  // 注册带配置的事件监听
  registerCoreEvents();

  /** 统一注册事件 */
  function registerCoreEvents() {
    manageEventListeners(on);
  }

  /** 统一注销事件 */
  function unregisterCoreEvents() {
    manageEventListeners(off);
  }

  /**
   * 事件监听器管理中心（策略模式实现）
   *
   * 实现特性：
   * 1. 统一管理两类事件监听：
   *    - 静默事件(SILENT_EVENTS)：需要强制捕获阶段处理的基础系统级事件
   *    - 业务事件(events)：可配置监听目标的交互事件
   * 2. 支持动态切换监听状态（绑定/解绑）
   *
   * @param operationType 操作策略选择器
   *     使用 'on' 启用事件监听 | 'off' 移除事件监听
   *
   * 实现要点：
   * 1. 静默事件处理逻辑：
   *    - 始终在捕获阶段触发（capture: true）
   *    - 使用统一的事件处理器(handleSilentEvent)
   *    - 无特定监听目标（默认window对象）
   *
   * 2. 业务事件处理逻辑：
   *    - 支持自定义监听目标（target 配置项）
   *    - 捕获阶段监听保证处理优先级（capture: true）
   *    - 每个事件类型对应独立处理器(handler)
   *
   * 设计优势：
   *  - 通过策略模式消除重复代码
   *  - 配置与执行逻辑解耦
   *  - 类型安全的事件操作接口
   */
  function manageEventListeners(operationType: typeof on | typeof off) {
    /* 系统级静默事件处理（固定策略） */
    SILENT_EVENTS.forEach((event) => operationType(event, handleSilentEvent, { capture: true }));

    /* 可配置业务事件处理（动态策略） */
    events.forEach(({ type, handler, target }) => {
      operationType(type, handler, {
        target, // 支持 window/document/特定元素
        capture: true, // 确保在事件捕获阶段处理
      });
    });
  }

  /** 处理活动元素变化 */
  function handleActiveElement(e: PointerEvent) {
    if (!inspectorState.isEnable || inspectorState.isTreeOpen) return;

    // 根据设备类型获取目标元素
    const targetEl = (
      e.pointerType === 'touch' ? document.elementFromPoint(e.clientX, e.clientY) : e.target
    ) as HTMLElement;

    const validEl = checkValidElement(targetEl) ? targetEl : null;
    if (validEl !== inspectorState.activeEl) {
      inspectorState.activeEl = validEl;
      onActive();
    }
  }

  /** 处理进入屏幕事件（移动端触控） */
  function handleEnterScreen(e: PointerEvent) {
    if (e.pointerType === 'touch') {
      handleActiveElement(e); // 移动端首次触摸时获取焦点
    }
  }

  /** 处理离开屏幕事件 */
  function handleLeaveScreen(e: PointerEvent) {
    if (crossIframe && !isTopWindow) return;

    // PC端鼠标移出窗口时清空焦点
    if (e.pointerType === 'mouse' && !e.relatedTarget) {
      inspectorState.activeEl = null;
      onActive();
    }
  }

  /** 处理键盘按下事件 */
  function handleKeyDown(e: KeyboardEvent) {
    if (!inspectorState.activeEl || !SHORTCUT_KEYS.includes(e.code)) return;

    // 动态修改事件对象属性
    redefineEventProperty(e, 'type', () => `key${e.code}`.toLowerCase());
    redefineEventProperty(e, 'target', () => inspectorState.activeEl);

    setupClickedElementAttrs(e);
    handleInspect(e as unknown as PointerEvent);
  }

  /** 处理键盘释放事件 */
  function handleKeyUp(e: KeyboardEvent) {
    if (SHORTCUT_KEYS.includes(e.code)) {
      cleanClickedElementAttrs();
    }
  }

  /** 处理元素检查事件 */
  function handleInspect(e: PointerEvent) {
    handleSilentEvent(e);

    const targetEl = e.target as HTMLElement;
    if (checkClickedElement(targetEl)) {
      const finalEl = inspectorState.activeEl?.isConnected ? inspectorState.activeEl : targetEl;

      inspectorState.activeEl = null;
      if (once) onExitInspect();

      // 根据操作类型触发不同回调
      const openMethod = e.metaKey || e.type === 'longpress' ? onOpenTree : onOpenEditor;
      openMethod(finalEl);
    }
  }

  return unregisterCoreEvents;
}

/** 事件回调包装器：确保执行前清理元素属性 */
function withEventWrapper<T extends (...args: any[]) => any>(fn: T) {
  return function wrappedFn(...args: Parameters<T>): ReturnType<T> {
    cleanClickedElementAttrs();
    return fn(...args);
  };
}

/** 静默事件处理：阻止默认行为和冒泡 */
function handleSilentEvent(e: Event) {
  const isValidTarget = [e.target, (e as any).relatedTarget].some(checkValidElement);
  if (isValidTarget) {
    if (!CLICK_ATTACHMENT_EVENTS.includes(e.type)) {
      e.preventDefault();
    }
    e.stopPropagation();
  }
}

/** 动态重定义事件属性 */
function redefineEventProperty(e: Event, prop: keyof Event, getter: () => any) {
  Object.defineProperty(e, prop, { get: getter });
}
