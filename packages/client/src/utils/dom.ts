import { isStr } from '@open-editor/shared';
import { applyStyle, createStyleGetter } from './style';

export interface Props extends Record<string, any> {
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
  __html?: string;
  __text?: string;
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

  const { className, style, __html, __text, ...restProps } = props;
  if (className) {
    element.classList.add(...className.split(' '));
  }
  if (style) {
    applyStyle(element, style);
  }
  if (__html) {
    element.innerHTML = __html;
  } else if (__text) {
    element.innerText = __text;
  } else {
    for (const child of children) {
      append(element, isStr(child) ? document.createTextNode(child) : child);
    }
  }
  applyAttrs(element, restProps);

  return element;
}

export function append(parent: Node, ...children: Node[]) {
  for (const child of children) {
    parent.appendChild(child);
  }
}

export function applyAttrs(
  element: HTMLElement,
  attrs: Record<string, unknown>,
) {
  for (const property of Object.keys(attrs)) {
    const attr = attrs[property];
    if (attr) {
      element.setAttribute(property, String(attr));
    } else {
      element.removeAttribute(property);
    }
  }
}

export function getDOMRect(target: Element): Omit<DOMRect, 'toJSON'> {
  const domRect = target.getBoundingClientRect().toJSON();

  const zoom = createStyleGetter(target)('zoom');
  if (zoom && zoom !== 1) {
    Object.keys(domRect).forEach((key) => (domRect[key] *= zoom));
  }

  return domRect;
}

export function getHtml() {
  return document.documentElement;
}
