import { off, on } from './document';

export type Target = HTMLElement | Window;

export interface LongPressOptions extends AddEventListenerOptions {
  target?: Target;
  wait?: number;
}

export type LongPressEvent = CustomEvent<HTMLElement>;

export type LongPressListener = (ev: LongPressEvent) => void;

export type LongPressCache = {
  cb: LongPressListener;
  opts: LongPressOptions;
  stop: () => void;
};

const targetMap = new WeakMap<Target, LongPressCache[]>();

export const longPressHandler = {
  on: onLongPress,
  off: offLongPress,
};

function onLongPress(
  listener: LongPressListener,
  rawOpts: LongPressOptions = {},
) {
  const { target = window, once, ...options } = rawOpts;
  const caches = targetMap.get(target) ?? [];
  const cleanup = setupListener((event) => {
    listener(event);
    if (once) {
      offLongPress(listener, rawOpts);
    }
  }, options);
  const cache = {
    cb: listener,
    opts: rawOpts,
    stop: cleanup,
  };
  targetMap.set(target, [...caches, cache]);
}

function offLongPress(
  listener: LongPressListener,
  rawOpts: LongPressOptions = {},
) {
  const { target = window } = rawOpts;
  const caches = targetMap.get(target);
  if (caches) {
    const nextCaches = caches.filter((cache) => {
      if (isSameListener(cache, listener, rawOpts)) {
        cache.stop();
        return false;
      }
      return true;
    });
    if (nextCaches.length) {
      targetMap.set(target, nextCaches);
    } else {
      targetMap.delete(target);
    }
  }
}

const optionKeys = <const>['capture', 'passive', 'once'];
function isSameListener(
  cache: LongPressCache,
  cb: LongPressListener,
  opts: LongPressOptions,
) {
  return (
    cache.cb === cb && optionKeys.every((key) => cache.opts[key] === opts[key])
  );
}

function setupListener(listener: LongPressListener, rawOpts: LongPressOptions) {
  const { wait = 500, ...options } = rawOpts;

  let waitTimer: NodeJS.Timeout | number | null = null;

  function start(event: PointerEvent) {
    waitTimer = setTimeout(() => {
      const customEvent = new CustomEvent('longpress', {
        detail: <HTMLElement>event.target,
      });
      listener(customEvent);
    }, wait);
  }

  function clean() {
    if (waitTimer != null) {
      clearTimeout(waitTimer);
      waitTimer = null;
    }
  }

  function setup() {
    on('pointerdown', start, options);
    on('pointermove', clean, options);
    on('pointerup', clean, options);
    on('pointercancel', clean, options);
  }

  function cleanup() {
    off('pointerdown', start, options);
    off('pointermove', clean, options);
    off('pointerup', clean, options);
    off('pointercancel', clean, options);
  }

  setup();
  return cleanup;
}
