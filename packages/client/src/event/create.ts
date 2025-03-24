import { on, off } from '.';

/******** CustomEvent ********/
export type Target = HTMLElement | Window;

export interface CustomEventListenerOptions extends EventListenerOptions {
  target: Target;
}

export type AddCustomEventListenerOptions<AddCustomEventListenerUserOptions extends AnyObject> =
  CustomEventListenerOptions &
    Omit<AddEventListenerOptions, 'passive'> &
    AddCustomEventListenerUserOptions;

export type CustomEventListener = (e: PointerEvent) => void;

export interface CustomEventCache<AddCustomEventListenerUserOptions extends AnyObject> {
  cb: CustomEventListener;
  opts: AddCustomEventListenerOptions<AddCustomEventListenerUserOptions>;
  stop: () => void;
}

/******** SetupDispatcher ********/
export type SetupDispatcherListenerOptions<
  AddCustomEventListenerUserOptions extends AnyObject = AnyObject,
> = Omit<AddCustomEventListenerOptions<AddCustomEventListenerUserOptions>, 'once' | 'signal'>;

export type SetupDispatcherListener = (e: PointerEvent) => void;

export type SetupDispatcher<AddCustomEventListenerUserOptions extends AnyObject> = (
  listener: SetupDispatcherListener,
  options: SetupDispatcherListenerOptions<AddCustomEventListenerUserOptions>,
) => SetupDispatcherCleanListener;

export type SetupDispatcherCleanListener = () => void;

/**
 * Create a custom event dispatcher
 *
 * @param type custom event type
 * @param setupDispatcher setup custom event dispatcher
 */
export function createCustomEventDispatcher<
  AddCustomEventListenerUserOptions extends AnyObject = AnyObject,
>(type: string, setupDispatcher: SetupDispatcher<AddCustomEventListenerUserOptions>) {
  const targetMap = new WeakMap<Target, CustomEventCache<AddCustomEventListenerUserOptions>[]>();

  function addEventListener(
    cb: CustomEventListener,
    opts: AddCustomEventListenerOptions<AddCustomEventListenerUserOptions>,
  ) {
    const { once, signal, ...addOpts } = opts;
    const caches = targetMap.get(addOpts.target) || [];
    const index = caches.findIndex((cache) => isSameListener(cache, cb, opts));
    if (index === -1) {
      const remove = () => {
        if (signal) off('abort', remove, { target: signal });
        removeEventListener(cb, opts);
      };
      if (signal) on('abort', remove, { target: signal });
      const stop = setupDispatcher((e) => {
        if (once) remove();
        if (signal?.aborted) return;
        const evt = new PointerEvent(type, e);
        Object.defineProperty(evt, 'target', {
          value: e.target,
          enumerable: true,
        });
        cb(evt);
      }, addOpts);
      const nextCaches = [...caches, { cb, opts, stop }];
      targetMap.set(addOpts.target, nextCaches);
    }
  }

  function removeEventListener(cb: CustomEventListener, opts: CustomEventListenerOptions) {
    const caches = targetMap.get(opts.target) || [];
    const index = caches.findIndex((cache) => isSameListener(cache, cb, opts));
    if (index !== -1) {
      const nextCaches = [...caches];
      const [removedCache] = nextCaches.splice(index, 1);
      removedCache.stop();
      targetMap.set(opts.target, nextCaches);
    }
  }

  function isSameListener(
    cache: CustomEventCache<AddCustomEventListenerUserOptions>,
    cb: CustomEventListener,
    opts: CustomEventListenerOptions,
  ) {
    return cache.cb === cb && cache.opts.capture === opts.capture;
  }

  return {
    addEventListener,
    removeEventListener,
  };
}
