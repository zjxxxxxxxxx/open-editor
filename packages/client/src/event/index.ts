import longpress from './longpress';
import quickexit from './quickexit';
import rightclick from './rightclick';

export interface HTMLElementEventWithCustomEventMap
  extends HTMLElementEventMap {
  longpress: PointerEvent;
  quickexit: PointerEvent;
  rightclick: PointerEvent;
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

  switch (type) {
    case 'longpress':
      longpress.addEventListener(listener, opts);
      break;
    case 'quickexit':
      quickexit.addEventListener(listener, opts);
      break;
    case 'rightclick':
      rightclick.addEventListener(listener, opts);
      break;
    default:
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

  switch (type) {
    case 'longpress':
      longpress.removeEventListener(listener, opts);
      break;
    case 'quickexit':
      quickexit.removeEventListener(listener, opts);
      break;
    case 'rightclick':
      rightclick.removeEventListener(listener, opts);
      break;
    default:
      opts.target.removeEventListener(type, listener, opts);
  }
}
