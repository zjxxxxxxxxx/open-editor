import { append } from './dom';
import { jsx } from './jsx';

export const CSS_util = {
  px(value: string | number) {
    return `${value}px`;
  },
  pv(value: string) {
    return parseInt(value, 10);
  },
};

type PartialWithNull<T> = { [P in keyof T]?: T[P] | undefined | null };

export function applyStyle(
  element: HTMLElement,
  ...styles: PartialWithNull<CSSStyleDeclaration>[]
) {
  Object.assign(element.style, ...styles);
}

export function createStyleGetter(element: Element) {
  const style = window.getComputedStyle(element, null);
  return function getValue(property: string) {
    const value = style.getPropertyValue(property);
    return CSS_util.pv(value) || 0;
  };
}

export function createGlobalStyle(css: string) {
  let style: HTMLStyleElement;
  return {
    insert() {
      style ||= jsx('style', {
        type: 'text/css',
        __html: css,
      });

      append(document.body, style);
    },
    remove() {
      style?.remove();
    },
  };
}
