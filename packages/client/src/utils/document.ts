import { createStyleGetter } from './createStyleGetter';

export function applyStyle(
  element: HTMLElement,
  ...styles: Partial<CSSStyleDeclaration>[]
) {
  Object.assign(element.style, ...styles);
}

export function applyAttrs(
  element: HTMLElement,
  attrs: Record<string, unknown>,
) {
  for (const property of Object.keys(attrs)) {
    const attr = attrs[property];
    if (attr != null) {
      element.setAttribute(property, String(attr));
    } else {
      element.removeAttribute(property);
    }
  }
}

export const CSS_util = {
  px(value: string | number) {
    return `${value}px`;
  },
  pv(value: string) {
    return parseInt(value, 10);
  },
};

export function on<K extends keyof HTMLElementEventMap>(
  type: K,
  listener: (ev: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions & { target?: HTMLElement },
): void;
export function on(
  type: string,
  listener: (ev: any) => void,
  options?: AddEventListenerOptions & { target?: any },
): void;
export function on(type: any, listener: any, rawOpts: any = {}) {
  const { target = window, ...options } = rawOpts;
  target.addEventListener(type, listener, options);
}

export function off<K extends keyof HTMLElementEventMap>(
  type: K,
  listener: (ev: HTMLElementEventMap[K]) => void,
  options?: EventListenerOptions & { target?: HTMLElement },
): void;
export function off(
  type: string,
  listener: (ev: any) => void,
  options?: EventListenerOptions & { target?: any },
): void;
export function off(type: any, listener: any, rawOpts: any = {}) {
  const { target = window, ...options } = rawOpts;
  target.removeEventListener(type, listener, options);
}

export function create<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: ElementCreationOptions,
): HTMLElementTagNameMap[K];
export function create<T extends HTMLElement>(
  tagName: string,
  options?: ElementCreationOptions,
): T;
export function create(tagName: string, options?: ElementCreationOptions) {
  return document.createElement(tagName, options);
}

export function append(parent: HTMLElement | ShadowRoot, child: HTMLElement) {
  return parent.appendChild(child);
}

export function getDOMRect(target: Element): Omit<DOMRect, 'toJSON'> {
  const getValue = createStyleGetter(target);
  const domRect = target.getBoundingClientRect().toJSON();

  const zoom = getValue('zoom') || 1;
  if (zoom !== 1) {
    Object.keys(domRect).forEach((key) => (domRect[key] *= zoom));
  }

  return domRect;
}
