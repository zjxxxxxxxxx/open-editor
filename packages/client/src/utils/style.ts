import { append, create } from './dom';

export const CSS_util = {
  px(value: string | number) {
    return `${value}px`;
  },
  pv(value: string) {
    return parseInt(value, 10);
  },
};

export function setShadowStyle(root: ShadowRoot, ...css: string[]) {
  root.innerHTML = `<style type="text/css">${css.join('')}</style>`;
}

export function applyStyle(
  element: HTMLElement,
  ...styles: Partial<CSSStyleDeclaration>[]
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
      style ||= create('style', {
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
