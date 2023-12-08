import longpress from './longpress';
import quickexit from './quickexit';

export type HTMLElementEventWithLongPressMap = HTMLElementEventMap & {
  longpress: PointerEvent;
  quickexit: PointerEvent;
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
  rawOpts.target ??= window;
  if (type === 'longpress') {
    longpress.on(listener, rawOpts);
  } else if (type === 'quickexit') {
    quickexit.on(listener, rawOpts);
  } else {
    rawOpts.target.addEventListener(type, listener, rawOpts);
  }
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
  rawOpts.target ??= window;
  if (type === 'longpress') {
    longpress.off(listener, rawOpts);
  } else if (type === 'quickexit') {
    quickexit.off(listener, rawOpts);
  } else {
    rawOpts.target.removeEventListener(type, listener, rawOpts);
  }
}
