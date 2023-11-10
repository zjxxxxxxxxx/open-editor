import type { LongPressEvent } from './longPress';
import { longPress } from './longPress';

export type HTMLElementEventWithLongPressMap = HTMLElementEventMap & {
  longpress: LongPressEvent;
};

export function on<K extends keyof HTMLElementEventWithLongPressMap>(
  type: K,
  listener: (ev: HTMLElementEventWithLongPressMap[K]) => void,
  options?: AddEventListenerOptions & { target?: HTMLElement; wait?: number },
): void;
export function on(
  type: string,
  listener: (ev: any) => void,
  options?: AddEventListenerOptions & { target?: any },
): void;
export function on(type: any, listener: any, rawOpts: any = {}) {
  if (type === 'longpress') {
    return longPress.on(listener, rawOpts);
  }

  const { target = window, ...options } = rawOpts;
  target.addEventListener(type, listener, options);
}

export function off<K extends keyof HTMLElementEventWithLongPressMap>(
  type: K,
  listener: (ev: HTMLElementEventWithLongPressMap[K]) => void,
  options?: EventListenerOptions & { target?: HTMLElement; wait?: number },
): void;
export function off(
  type: string,
  listener: (ev: any) => void,
  options?: EventListenerOptions & { target?: any },
): void;
export function off(type: any, listener: any, rawOpts: any = {}) {
  if (type === 'longpress') {
    return longPress.off(listener, rawOpts);
  }

  const { target = window, ...options } = rawOpts;
  target.removeEventListener(type, listener, options);
}
