import { off, on } from './event';

export type Target = HTMLElement | Window;

export type LongPressEvent = PointerEvent;

export interface LongPressOptions extends AddEventListenerOptions {
  target?: Target;
  wait?: number;
}

export type LongPressListener = (event: PointerEvent) => void;

export type LongPressCache = {
  cb: LongPressListener;
  opts: LongPressOptions;
  stop: () => void;
};

export const longPress = {
  on: onLongPress,
  off: offLongPress,
};

const targetMap = new WeakMap<Target, LongPressCache[]>();

function onLongPress(
  listener: LongPressListener,
  rawOpts: LongPressOptions = {},
) {
  const { target = window, once, ...options } = rawOpts;
  const opts = { ...options, target };
  const caches = targetMap.get(target) ?? [];
  const cleanup = setupListener((event) => {
    listener(event);
    if (once) {
      offLongPress(listener, rawOpts);
    }
  }, opts);
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

const optionKeys = <const>['capture', 'passive', 'once', 'wait'];
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

  let waitTimer: number | null = null;

  function start(event: PointerEvent) {
    // Left Mouse, Touch Contact, Pen contact
    // see: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events#determining_button_states
    if (event.button === 0 && event.buttons === 1) {
      waitTimer = setTimeout(() => {
        const eventProxy = new Proxy(event, {
          get: (target, p) =>
            p === 'type'
              ? 'longpress'
              : // @ts-ignore
                target[p],
        });

        // Give the user a vibration prompt when entering the draggable state.
        // There are huge compatibility issues, so leave it to chance.
        // See: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate
        navigator.vibrate?.(15);

        listener(eventProxy);
      }, wait) as unknown as number;
    }
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
