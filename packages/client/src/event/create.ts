import { on, off } from '.';

/**
 * 可绑定事件的目标元素类型
 */
export type Target = HTMLElement | Window;

/**
 * 自定义事件监听器配置项
 */
export interface CustomEventListenerOptions extends EventListenerOptions {
  /**
   * 事件绑定的目标元素
   */
  target: Target;
}

/**
 * 扩展的自定义事件监听配置项
 */
export type AddCustomEventListenerOptions<AddCustomEventListenerUserOptions extends AnyObject> =
  CustomEventListenerOptions &
    Omit<AddEventListenerOptions, 'passive'> &
    AddCustomEventListenerUserOptions;

/**
 * 自定义事件监听回调函数
 */
export type CustomEventListener = (e: PointerEvent) => void;

/**
 * 事件缓存对象结构
 */
export interface CustomEventCache<AddCustomEventListenerUserOptions extends AnyObject> {
  /**
   * 事件回调函数
   */
  cb: CustomEventListener;
  /**
   * 事件配置选项
   */
  opts: AddCustomEventListenerOptions<AddCustomEventListenerUserOptions>;
  /**
   * 停止监听的函数
   */
  stop: () => void;
}

/**
 * 事件分发器监听器配置项
 */
export type SetupDispatcherListenerOptions<
  AddCustomEventListenerUserOptions extends AnyObject = AnyObject,
> = Omit<AddCustomEventListenerOptions<AddCustomEventListenerUserOptions>, 'once' | 'signal'>;

/**
 * 事件分发器监听回调函数
 */
export type SetupDispatcherListener = (e: PointerEvent) => void;

/**
 * 事件分发器函数类型
 */
export type SetupDispatcher<AddCustomEventListenerUserOptions extends AnyObject> = (
  listener: SetupDispatcherListener,
  options: SetupDispatcherListenerOptions<AddCustomEventListenerUserOptions>,
) => SetupDispatcherCleanListener;

/**
 * 清理事件分发的函数类型
 */
export type SetupDispatcherCleanListener = () => void;

/**
 * 创建自定义事件分发器
 * @param type - 自定义事件类型名称
 * @param setupDispatcher - 事件分发设置函数
 * @returns 包含事件监听管理方法的对象
 */
export function createCustomEventDispatcher<
  AddCustomEventListenerUserOptions extends AnyObject = AnyObject,
>(type: string, setupDispatcher: SetupDispatcher<AddCustomEventListenerUserOptions>) {
  // 使用WeakMap避免内存泄漏
  const targetMap = new WeakMap<Target, CustomEventCache<AddCustomEventListenerUserOptions>[]>();

  /**
   * 添加事件监听
   * @param cb - 事件回调函数
   * @param opts - 事件配置选项
   */
  function addEventListener(
    cb: CustomEventListener,
    opts: AddCustomEventListenerOptions<AddCustomEventListenerUserOptions>,
  ) {
    const { once, signal, ...addOpts } = opts;
    const caches = targetMap.get(addOpts.target) || [];

    // 防止重复添加监听
    if (!caches.some((cache) => isSameListener(cache, cb, opts))) {
      const remove = () => {
        if (signal) off('abort', remove, { target: signal });
        removeEventListener(cb, opts);
      };

      // 设置中止信号监听
      if (signal) on('abort', remove, { target: signal });

      // 创建事件分发器
      const stop = setupDispatcher((e) => {
        if (once) remove();
        if (signal?.aborted) return;

        // 创建自定义PointerEvent
        const evt = new PointerEvent(type, e);
        Object.defineProperty(evt, 'target', {
          value: e.target,
          enumerable: true,
        });

        cb(evt);
      }, addOpts);

      // 更新缓存
      targetMap.set(addOpts.target, [...caches, { cb, opts, stop }]);
    }
  }

  /**
   * 移除事件监听
   * @param cb - 要移除的回调函数
   * @param opts - 对应的事件配置
   */
  function removeEventListener(cb: CustomEventListener, opts: CustomEventListenerOptions) {
    const caches = targetMap.get(opts.target) || [];
    const index = caches.findIndex((cache) => isSameListener(cache, cb, opts));

    if (index !== -1) {
      const [removed] = caches.splice(index, 1);
      removed.stop();
      targetMap.set(opts.target, caches);
    }
  }

  /**
   * 判断是否为相同监听器
   * @param cache - 缓存对象
   * @param cb - 回调函数
   * @param opts - 配置选项
   */
  function isSameListener(
    cache: CustomEventCache<AddCustomEventListenerUserOptions>,
    cb: CustomEventListener,
    opts: CustomEventListenerOptions,
  ) {
    return cache.cb === cb && cache.opts.capture === opts.capture;
  }

  return { addEventListener, removeEventListener };
}
