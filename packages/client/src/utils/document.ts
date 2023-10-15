import { isStr } from '@open-editor/shared';
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

export interface Props extends Record<string, any> {
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
  html?: string;
  text?: string;
}

export type Children = (HTMLElement | string)[];

export function create<K extends keyof HTMLElementTagNameMap>(
  type: K,
  props?: Props,
  ...children: Children
): HTMLElementTagNameMap[K];
export function create<T extends HTMLElement>(
  type: string,
  props?: Props,
  ...children: Children
): T;
export function create(type: string, props: Props = {}, ...children: Children) {
  const element = document.createElement(type);

  const { className, style, html, ...restProps } = props;
  if (className) {
    element.classList.add(className);
  }
  if (style) {
    applyStyle(element, style);
  }
  if (html) {
    element.innerHTML = html;
  }
  applyAttrs(element, restProps);

  for (const child of children) {
    append(element, isStr(child) ? document.createTextNode(child) : child);
  }

  return element;
}

export function append(parent: Node, ...children: Node[]) {
  for (const child of children) {
    parent.appendChild(child);
  }
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

export function setShadowCSS(root: ShadowRoot, ...css: string[]) {
  root.innerHTML = `<style>${css.join('')}</style>`;
}
