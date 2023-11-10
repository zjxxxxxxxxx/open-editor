import { isStr } from '@open-editor/shared';
import { append, applyAttrs } from './dom';
import { applyStyle } from './style';

export interface Props<T = HTMLElement> extends Record<string, any> {
  ref?(el: T): void;
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
  __html?: string;
  __text?: string;
}

export type Children = (HTMLElement | string)[];

export function jsx<K extends keyof HTMLElementTagNameMap>(
  type: K,
  props?: Props<HTMLElementTagNameMap[K]>,
  ...children: Children
): HTMLElementTagNameMap[K];
export function jsx<T extends HTMLElement>(
  type: string,
  props?: Props<T>,
  ...children: Children
): T;
export function jsx(type: string, props: Props = {}, ...children: Children) {
  const element = document.createElement(type);

  const { ref, className, style, __html, __text, ...restProps } = props;
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
  ref?.(element);

  return element;
}
