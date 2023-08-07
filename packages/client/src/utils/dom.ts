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

export const addEventListener = CLIENT
  ? window.addEventListener
  : () => {
      throw new Error(
        '@open-editor/client: server side not support addEventListener.',
      );
    };
export const removeEventListener = CLIENT
  ? window.removeEventListener
  : () => {
      throw new Error(
        '@open-editor/client: server side not support removeEventListener.',
      );
    };
export const createElement = CLIENT
  ? document.createElement.bind(document)
  : () => {
      throw new Error(
        '@open-editor/client: server side not support createElement.',
      );
    };
export const appendChild = CLIENT
  ? (target: HTMLElement | ShadowRoot, node: HTMLElement) =>
      target.appendChild(node)
  : () => {
      throw new Error(
        '@open-editor/client: server side not support appendChild.',
      );
    };
