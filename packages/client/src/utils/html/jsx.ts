import { isStr } from '@open-editor/shared';
import { append, applyAttrs } from './dom';
import { addClass, applyStyle } from './style';

export interface JSXProps<T = HTMLElement> extends Record<string, any> {
  ref?(el: T): void;
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
  __html?: string;
}

export type JSXNode = HTMLElement | string | false | null | undefined;

export function jsx<K extends keyof HTMLElementTagNameMap>(
  type: K,
  props?: JSXProps<HTMLElementTagNameMap[K]>,
  ...children: JSXNode[]
): HTMLElementTagNameMap[K];
export function jsx<T extends HTMLElement>(
  type: string,
  props?: JSXProps<T>,
  ...children: JSXNode[]
): T;
export function jsx(
  type: string,
  props: JSXProps = {},
  ...children: JSXNode[]
) {
  const { ref, className, style, __html, ...attrs } = props;

  const el = document.createElement(type);

  if (className) {
    addClass(el, className);
  }
  if (style) {
    applyStyle(el, style);
  }
  if (__html) {
    el.innerHTML = __html;
  }
  applyAttrs(el, attrs);

  for (const child of children) {
    if (child) {
      append(el, isStr(child) ? document.createTextNode(child) : child);
    }
  }

  ref?.(el);

  return el;
}
