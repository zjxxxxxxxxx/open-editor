// 导入自定义事件处理器模块
import longpress from './longpress';
import quickexit from './quickexit';
import rightclick from './rightclick';

/**
 * 扩展的标准DOM事件映射接口，增加自定义事件类型定义
 */
export interface HTMLElementEventWithCustomEventMap extends HTMLElementEventMap {
  /**
   * 长按事件，当元素被持续按压超过阈值时触发
   * 关联模块：./longpress
   */
  longpress: PointerEvent;

  /**
   * 快速离开事件，当指针快速移出元素区域时触发
   * 关联模块：./quickexit
   */
  quickexit: PointerEvent;

  /**
   * 右键点击事件，替代默认的contextmenu事件
   * 关联模块：./rightclick
   */
  rightclick: PointerEvent;
}

/**
 * 通用事件绑定函数
 * @param type 事件类型，支持标准DOM事件和自定义事件
 * @param listener 事件监听回调函数
 * @param opts 事件配置选项
 */
export function on<K extends keyof HTMLElementEventWithCustomEventMap>(
  type: K,
  listener: (ev: HTMLElementEventWithCustomEventMap[K]) => void,
  opts?: AddEventListenerOptions & {
    /** 事件绑定目标元素，默认window对象 */
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
      // 处理标准DOM事件
      options.target.addEventListener(type, listener, options);
  }
}

/**
 * 通用事件解绑函数
 * @param type 事件类型，支持标准DOM事件和自定义事件
 * @param listener 已注册的事件监听回调
 * @param opts 事件配置选项
 */
export function off<K extends keyof HTMLElementEventWithCustomEventMap>(
  type: K,
  listener: (ev: HTMLElementEventWithCustomEventMap[K]) => void,
  opts?: EventListenerOptions & {
    /** 事件绑定目标元素，默认window对象 */
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
      // 处理标准DOM事件解绑
      options.target.removeEventListener(type, listener, options);
  }
}
