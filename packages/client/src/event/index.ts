import longpress from './longpress';
import quickexit from './quickexit';

export interface HTMLElementEventWithCustomEventMap
  extends HTMLElementEventMap {
  longpress: PointerEvent;
  quickexit: PointerEvent;
}

export function on<K extends keyof HTMLElementEventWithCustomEventMap>(
  type: K,
  listener: (ev: HTMLElementEventWithCustomEventMap[K]) => void,
  opts?: AddEventListenerOptions & {
    target?: HTMLElement | null;
    wait?: number;
  },
): void;
export function on(
  type: string,
  listener: (ev: any) => void,
  opts?: AddEventListenerOptions & { target?: any },
): void;
export function on(type: any, listener: any, opts: any = {}) {
  opts.target ||= window;
  if (type === 'longpress') {
    longpress.addEventListener(listener, opts);
  } else if (type === 'quickexit') {
    quickexit.addEventListener(listener, opts);
  } else {
    opts.target.addEventListener(type, listener, opts);
  }
}

export function off<K extends keyof HTMLElementEventWithCustomEventMap>(
  type: K,
  listener: (ev: HTMLElementEventWithCustomEventMap[K]) => void,
  opts?: EventListenerOptions & {
    target?: HTMLElement | null;
    wait?: number;
  },
): void;
export function off(
  type: string,
  listener: (ev: any) => void,
  opts?: EventListenerOptions & { target?: any },
): void;
export function off(type: any, listener: any, opts: any = {}) {
  opts.target ||= window;
  if (type === 'longpress') {
    longpress.removeEventListener(listener, opts);
  } else if (type === 'quickexit') {
    quickexit.removeEventListener(listener, opts);
  } else {
    opts.target.removeEventListener(type, listener, opts);
  }
}
