/* eslint-disable @typescript-eslint/ban-types */
import { CLIENT } from '../constants';

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

export const cssUtils = {
  /**
   * 10 -> '10px'
   */
  px(value: string | number) {
    return `${value}px`;
  },
  /**
   * '10px' -> 10
   */
  pv(value: string) {
    return parseInt(value, 10);
  },
};

export function on<K extends keyof HTMLElementEventMap>(
  type: K,
  listener: (ev: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions & { target?: HTMLElement },
): void;
export function on<K extends keyof WindowEventMap>(
  type: K,
  listener: (ev: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions & { target?: Window },
): void;
export function on(
  type: string,
  listener: (ev: any) => void,
  options?: AddEventListenerOptions & { target?: any },
): void;
export function on(type: any, listener: any, options: any = {}) {
  if (CLIENT) {
    if (!options.target) {
      options.target = window;
    }
    options.target.addEventListener(type, listener, options);
  }
}

export function off<K extends keyof HTMLElementEventMap>(
  type: K,
  listener: (ev: HTMLElementEventMap[K]) => void,
  options?: EventListenerOptions & { target?: HTMLElement },
): void;
export function off<K extends keyof WindowEventMap>(
  type: K,
  listener: (ev: WindowEventMap[K]) => void,
  options?: EventListenerOptions & { target?: Window },
): void;
export function off(
  type: string,
  listener: (ev: any) => void,
  options?: EventListenerOptions & { target?: any },
): void;
export function off(type: any, listener: any, options: any = {}) {
  if (CLIENT) {
    if (!options.target) {
      options.target = window;
    }
    options.target.removeEventListener(type, listener, options);
  }
}

export function create<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: ElementCreationOptions,
): HTMLElementTagNameMap[K];
export function create(
  tagName: string,
  options?: ElementCreationOptions,
): HTMLElement;
export function create(tagName: string, options?: ElementCreationOptions) {
  if (!CLIENT) {
    throw new Error(
      '@open-editor/client: server side not support createElement.',
    );
  }

  return document.createElement(tagName, options);
}

export function append(target: Node, node: HTMLElement) {
  if (!CLIENT) {
    throw new Error(
      '@open-editor/client: server side not support appendChild.',
    );
  }

  return target.appendChild(node);
}