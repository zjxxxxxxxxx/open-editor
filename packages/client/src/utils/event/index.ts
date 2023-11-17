import { longPress } from './longPress';

export type HTMLElementEventWithLongPressMap = HTMLElementEventMap & {
  longpress: PointerEvent;
};

export function on<K extends keyof HTMLElementEventWithLongPressMap>(
  type: K,
  listener: (ev: HTMLElementEventWithLongPressMap[K]) => void,
  opts?: AddEventListenerOptions & { target?: HTMLElement; wait?: number },
): void;
export function on(
  type: string,
  listener: (ev: any) => void,
  opts?: AddEventListenerOptions & { target?: any },
): void;
export function on(type: any, listener: any, rawOpts: any = {}) {
  if (type === 'longpress') {
    return longPress.on(listener, rawOpts);
  }

  const { target = window, ...opts } = rawOpts;
  target.addEventListener(type, listener, opts);
}

export function off<K extends keyof HTMLElementEventWithLongPressMap>(
  type: K,
  listener: (ev: HTMLElementEventWithLongPressMap[K]) => void,
  opts?: EventListenerOptions & { target?: HTMLElement; wait?: number },
): void;
export function off(
  type: string,
  listener: (ev: any) => void,
  opts?: EventListenerOptions & { target?: any },
): void;
export function off(type: any, listener: any, rawOpts: any = {}) {
  if (type === 'longpress') {
    return longPress.off(listener, rawOpts);
  }

  const { target = window, ...opts } = rawOpts;
  target.removeEventListener(type, listener, opts);
}
