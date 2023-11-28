import { isStr } from '@open-editor/shared';
import { append, applyAttrs } from './dom';
import { addClass, applyStyle } from './style';

export interface Props<T = HTMLElement> extends Record<string, any> {
  ref?(el: T): void;
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
  __html?: string;
  __text?: string;
}

export type Children = (HTMLElement | string | null)[];

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
  const el = document.createElement(type);

  const { ref, className, style, __html, __text, ...attrs } = props;
  if (className) {
    addClass(el, className);
  }
  if (style) {
    applyStyle(el, style);
  }
  if (__html) {
    el.innerHTML = __html;
  } else if (__text) {
    el.innerText = __text;
  }
  applyAttrs(el, attrs);

  for (const child of children) {
    if (child !== null) {
      append(el, isStr(child) ? document.createTextNode(child) : child);
    }
  }

  ref?.(el);

  return el;
}
