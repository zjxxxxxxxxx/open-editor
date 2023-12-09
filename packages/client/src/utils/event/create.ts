import { omit } from '../util';

/******** CustomEvent ********/

export type Target = HTMLElement | Window;

export interface CustomEventListenerOptions extends EventListenerOptions {
  target: Target;
}

export type AddCustomEventListenerOptions<
  AddCustomEventListenerUserOptions extends AnyObject,
> = CustomEventListenerOptions &
  AddEventListenerOptions &
  AddCustomEventListenerUserOptions;

export type CustomEventListener = (e: PointerEvent) => void;

export interface CustomEventCache<
  AddCustomEventListenerUserOptions extends AnyObject,
> {
  cb: CustomEventListener;
  opts: AddCustomEventListenerOptions<AddCustomEventListenerUserOptions>;
  stop: () => void;
}

/******** CustomEvent ********/

/******** SetupListener ********/

export type SetupListenerListenerOptions<
  AddCustomEventListenerUserOptions extends AnyObject = AnyObject,
> = Omit<
  AddCustomEventListenerOptions<AddCustomEventListenerUserOptions>,
  'once'
>;

export type SetupListenerListener = (e: PointerEvent) => void;

export type SetupListener<AddCustomEventListenerUserOptions extends AnyObject> =
  (
    listener: SetupListenerListener,
    options: SetupListenerListenerOptions<AddCustomEventListenerUserOptions>,
  ) => SetupListenerCleanListener;

export type SetupListenerCleanListener = () => void;

/******** SetupListener ********/

export function createCustomEvent<
  AddCustomEventListenerUserOptions extends AnyObject = AnyObject,
>(
  type: string,
  setupListener: SetupListener<AddCustomEventListenerUserOptions>,
) {
  const targetMap = new WeakMap<
    Target,
    CustomEventCache<AddCustomEventListenerUserOptions>[]
  >();

  function addEventListener(
    cb: CustomEventListener,
    opts: AddCustomEventListenerOptions<AddCustomEventListenerUserOptions>,
  ) {
    const { target, once } = opts;
    const caches = targetMap.get(target) || [];
    const index = caches.findIndex((cache) => isSameListener(cache, cb, opts));
    if (index === -1) {
      const stop = setupListener(
        (e) => {
          if (once) removeEventListener(cb, opts);
          const evt = new PointerEvent(type, e);
          Object.defineProperty(evt, 'target', {
            value: e.target,
            enumerable: true,
          });
          cb(evt);
        },
        omit(opts, 'once'),
      );
      const nextCaches = [...caches, { cb, opts, stop }];
      targetMap.set(target, nextCaches);
    }
  }

  function removeEventListener(
    cb: CustomEventListener,
    opts: CustomEventListenerOptions,
  ) {
    const { target } = opts;
    const caches = targetMap.get(target) || [];
    const index = caches.findIndex((cache) => isSameListener(cache, cb, opts));
    if (index !== -1) {
      const nextCaches = [...caches];
      nextCaches.splice(index, 1);
      targetMap.set(target, nextCaches);
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

window.removeEventListener;
