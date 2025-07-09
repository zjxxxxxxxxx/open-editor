import { IS_CLIENT } from '../constants';
import longpress from './longpress';
import quickexit from './quickexit';
import rightclick from './rightclick';

/**
 * 扩展的标准 DOM 事件映射接口，增加自定义事件类型定义
 */
export interface HTMLElementEventWithCustomEventMap extends HTMLElementEventMap {
  /**
   * 长按事件，当元素被持续按压超过阈值时触发
   */
  longpress: PointerEvent;

  /**
   * 快速离开事件，当指针快速移出元素区域时触发
   */
  quickexit: PointerEvent;

  /**
   * 右键点击事件，替代默认的 contextmenu 事件
   */
  rightclick: PointerEvent;
}

/**
 * 通用事件绑定函数
 * @param type 事件类型，支持标准 DOM 事件和自定义事件
 * @param listener 事件监听回调函数
 * @param opts 事件配置选项
 */
export function on<K extends keyof HTMLElementEventWithCustomEventMap>(
  type: K,
  listener: (ev: HTMLElementEventWithCustomEventMap[K]) => void,
  opts?: AddEventListenerOptions & {
    /** 事件绑定目标元素，默认 window 对象 */
    target?: HTMLElement | null;
    /** 事件延迟触发时间(ms) */
    wait?: number;
  },
): void;

/**
 * 通用事件绑定函数（动态事件类型版本）
 * @param type 任意事件类型字符串
 * @param listener 事件监听回调函数
 * @param opts 事件配置选项
 */
export function on(type: string, listener: (ev: any) => void, opts?: any): void;

/**
 * 事件绑定实现函数
 */
export function on(type: any, listener: any, options: any = {}) {
  // 设置默认事件目标
  options.target ||= window;

  // 根据事件类型选择处理模块
  switch (type) {
    case 'longpress':
      longpress.addEventListener(listener, options);
      break;
    case 'quickexit':
      quickexit.addEventListener(listener, options);
      break;
    case 'rightclick':
      rightclick.addEventListener(listener, options);
      break;
    default:
      // 处理标准 DOM 事件
      options.target.addEventListener(type, listener, options);
  }
}

/**
 * 通用事件解绑函数
 * @param type 事件类型，支持标准 DOM 事件和自定义事件
 * @param listener 已注册的事件监听回调
 * @param opts 事件配置选项
 */
export function off<K extends keyof HTMLElementEventWithCustomEventMap>(
  type: K,
  listener: (ev: HTMLElementEventWithCustomEventMap[K]) => void,
  opts?: EventListenerOptions & {
    /** 事件绑定目标元素，默认 window 对象 */
    target?: HTMLElement | null;
    /** 事件延迟解绑时间(ms) */
    wait?: number;
  },
): void;

/**
 * 通用事件解绑函数（动态事件类型版本）
 * @param type 任意事件类型字符串
 * @param listener 已注册的事件监听回调
 * @param opts 事件配置选项
 */
export function off(type: string, listener: (ev: any) => void, opts?: any): void;

/**
 * 事件解绑实现函数
 */
export function off(type: any, listener: any, options: any = {}) {
  // 设置默认事件目标
  options.target ||= window;

  // 根据事件类型选择处理模块
  switch (type) {
    case 'longpress':
      longpress.removeEventListener(listener, options);
      break;
    case 'quickexit':
      quickexit.removeEventListener(listener, options);
      break;
    case 'rightclick':
      rightclick.removeEventListener(listener, options);
      break;
    default:
      // 处理标准 DOM 事件解绑
      options.target.removeEventListener(type, listener, options);
  }
}

/**
 * 在客户端环境中，当文档解析完成或触发 DOMContentLoaded 事件后执行回调
 *
 * - 仅在浏览器环境（非 SSR）时生效，如果在服务端运行则直接返回
 * - 当 document.readyState 为 'loading' 时，表示 DOM 树尚未解析完毕，
 *   此时会挂载一个一次性监听器，在 DOMContentLoaded 触发后执行回调
 * - 当 document.readyState 为 'interactive' 或 'complete' 时，DOM 已可交互，
 *   回调会被立即执行，无需等待事件
 * @param listener - 文档可交互时执行的函数
 * @example
 * onDocumentReady(() => {
 *   // 此处可安全访问 document.body 及其它 DOM 元素
 *   initializeApp();
 * });
 */
export function onDocumentReady(listener: () => void) {
  // 仅在客户端环境生效，避免在服务端渲染时执行
  if (!IS_CLIENT) {
    return;
  }

  // 如果文档仍在解析中，监听一次性 DOMContentLoaded 事件
  if (document.readyState === 'loading') {
    on('DOMContentLoaded', listener, { once: true });
  } else {
    // 文档已处于 interactive 或 complete，直接执行回调
    setTimeout(listener, 0);
  }
}
