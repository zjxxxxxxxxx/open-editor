import { off, on } from './document';

export type Target = HTMLElement | Window;

export interface LongPressOptions extends AddEventListenerOptions {
  target?: Target;
  wait?: number;
}

export type LongPressEvent = CustomEvent<HTMLElement>;

export type LongPressListener = (ev: LongPressEvent) => void;

export type ListenerMap = {
  listener: LongPressListener;
  options: LongPressOptions;
  cleanup: any;
};

const targetMap = new WeakMap<Target, ListenerMap[]>();

export const longPressHandler = {
  on: onLongPress,
  off: offLongPress,
};

function onLongPress(
  listener: LongPressListener,
  rawOptions: LongPressOptions = {},
) {
  const options = {
    ...rawOptions,
    target: rawOptions.target ?? window,
  };

  const listenerMaps = targetMap.get(options.target) ?? [];
  listenerMaps.push({
    listener,
    options,
    cleanup: setupListener(listener, options),
  });
  targetMap.set(options.target, listenerMaps);
}

function offLongPress(
  listener: LongPressListener,
  rawOptions: LongPressOptions = {},
) {
  const options = {
    ...rawOptions,
    target: rawOptions.target ?? window,
  };

  const listenerMaps = targetMap.get(options.target);
  if (listenerMaps) {
    const nextListenerMaps = listenerMaps.filter((listenerMap) => {
      if (
        listenerMap.listener === listener &&
        listenerMap.options.capture === options.capture
      ) {
        listenerMap.cleanup();
        return false;
      }
      return true;
    });
    if (nextListenerMaps.length) {
      targetMap.set(options.target, nextListenerMaps);
    } else {
      targetMap.delete(options.target);
    }
  }
}

function setupListener(listener: LongPressListener, options: LongPressOptions) {
  let timer: NodeJS.Timeout | number | null = null;

  function start(event: PointerEvent) {
    timer = setTimeout(() => {
      const customEvent = new CustomEvent('longpress', {
        detail: <HTMLElement>event.target,
      });
      listener(customEvent);
    }, options.wait ?? 600);
  }

  function clean() {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
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
