export type Target = HTMLElement | Window;

export interface CustomEventOptions extends AddEventListenerOptions {
  target?: Target;
}

export type CustomEventSetupListener<CustomEventUserOptions extends object> = (
  listener: CustomEventListener,
  rawOpts: Omit<CustomEventOptions & CustomEventUserOptions, 'once'>,
) => CustomEventCleanListener;

export type CustomEventCleanListener = () => void;

export interface CreateCustomEventUserOptions {
  addOptions?: string[];
}

export type CustomEventListener = (e: PointerEvent) => void;

export type CustomEventCache<CustomEventUserOptions extends object> = {
  cb: CustomEventListener;
  opts: CustomEventOptions & CustomEventUserOptions;
  stop: () => void;
};

export function createCustomEvent<CustomEventUserOptions extends object>(
  type: string,
  setupListener: CustomEventSetupListener<CustomEventUserOptions>,
  options: CreateCustomEventUserOptions = {},
) {
  const { addOptions = [] } = options;

  const targetMap = new WeakMap<
    Target,
    CustomEventCache<CustomEventUserOptions>[]
  >();

  function onListener(
    listener: CustomEventListener,
    rawOpts: CustomEventOptions & CustomEventUserOptions,
  ) {
    const { target = window, once, ...opts } = rawOpts ?? {};
    const caches = targetMap.get(target) ?? [];
    const clean = setupListener(
      (e) => {
        Object.defineProperty(e, 'type', {
          value: type,
        });
        listener(e);
        if (once) {
          offListener(listener, rawOpts);
        }
      },
      // @ts-ignore
      { ...opts, target },
    );
    const cache = {
      cb: listener,
      opts: rawOpts,
      stop: clean,
    };
    targetMap.set(target, [...caches, cache]);
  }

  function offListener(
    listener: CustomEventListener,
    rawOpts: CustomEventOptions & CustomEventUserOptions,
  ) {
    const { target = window } = rawOpts ?? {};
    const caches = targetMap.get(target);
    if (caches) {
      const nextCaches = caches.filter((cache) => {
        const isSame = isSameListener(cache, listener, rawOpts);
        if (isSame) {
          cache.stop();
        }
        return !isSame;
      });
      if (nextCaches.length) {
        targetMap.set(target, nextCaches);
      } else {
        targetMap.delete(target);
      }
    }
  }

  const optKeys = ['capture', 'passive', 'once', ...addOptions];
  function isSameListener(
    cache: CustomEventCache<CustomEventUserOptions>,
    cb: CustomEventListener,
    opts: CustomEventUserOptions,
  ) {
    return (
      cache.cb === cb &&
      optKeys.every(
        (key) =>
          // @ts-ignore
          cache.opts[key] === opts[key],
      )
    );
  }

  return {
    on: onListener,
    off: offListener,
  };
}
