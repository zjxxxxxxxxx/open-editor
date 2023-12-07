import { off, on } from '.';

export type Target = HTMLElement | Window;

export interface LongPressOptions extends AddEventListenerOptions {
  target?: Target;
  wait?: number;
}

export type LongPressListener = (e: PointerEvent) => void;

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
  const { target = window, once, ...opts } = rawOpts;
  const caches = targetMap.get(target) ?? [];
  const cleanup = setupListener(
    (e) => {
      listener(e);
      if (once) {
        offLongPress(listener, rawOpts);
      }
    },
    {
      ...opts,
      target,
    },
  );
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

const optKeys = <const>['capture', 'passive', 'once', 'wait'];
function isSameListener(
  cache: LongPressCache,
  cb: LongPressListener,
  opts: LongPressOptions,
) {
  return (
    cache.cb === cb && optKeys.every((key) => cache.opts[key] === opts[key])
  );
}

function setupListener(listener: LongPressListener, rawOpts: LongPressOptions) {
  const { wait = 300, ...opts } = rawOpts;

  function setup() {
    on('pointerdown', start, opts);
    on('pointermove', clean, opts);
    on('pointerup', clean, opts);
    on('pointercancel', clean, opts);
  }

  function cleanup() {
    off('pointerdown', start, opts);
    off('pointermove', clean, opts);
    off('pointerup', clean, opts);
    off('pointercancel', clean, opts);
  }

  let waitTimer: number | null = null;

  function start(e: PointerEvent) {
    // Left Mouse, Touch Contact, Pen contact
    // see: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events#determining_button_states
    if (e.button === 0 && e.buttons === 1) {
      waitTimer = setTimeout(() => {
        Object.defineProperty(e, 'type', {
          value: 'longpress',
        });

        // Give the user a vibration prompt when entering the draggable state.
        // There are huge compatibility issues, so leave it to chance.
        // See: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate
        navigator.vibrate?.(15);

        listener(e);
      }, wait) as unknown as number;
    }
  }

  function clean() {
    if (waitTimer != null) {
      clearTimeout(waitTimer);
      waitTimer = null;
    }
  }

  setup();
  return cleanup;
}
