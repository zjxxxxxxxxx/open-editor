import { appendChild } from './dom';

type PartialWithNull<T> = { [P in keyof T]?: T[P] | undefined | null };

export const CSS_util = {
  px(value: string | number) {
    return `${value}px`;
  },
  pv(value: string) {
    return Number.parseFloat(value);
  },
};

export function applyStyle(
  el: HTMLElement,
  ...styles: PartialWithNull<CSSStyleDeclaration>[]
) {
  Object.assign(el.style, ...styles);
}

export function computedStyle(el: HTMLElement) {
  const style = getComputedStyle(el, null);
  // @ts-ignore
  function get(property: string): number;
  function get(property: string, toNumber: boolean): number | string;
  function get(property: string, toNumber: true): number;
  function get(property: string, toNumber: false): string;
  function get(property: any, toNumber = true) {
    let value = style.getPropertyValue(property);
    // @ts-ignore
    if (toNumber) value = CSS_util.pv(value) || 0;
    return value;
  }
  return get;
}

export function globalStyle(css: string) {
  const style = <style type="text/css">{css}</style>;
  return {
    mount() {
      // Insert into `body` to override the same styles that may have been set
      if (!style.isConnected) appendChild(document.body, style);
    },
    unmount() {
      if (style.isConnected) style.remove();
    },
  };
}

export function addClass(el: HTMLElement, className: string) {
  el.classList.add(...className.split(' '));
}

export function removeClass(el: HTMLElement, className: string) {
  el.classList.remove(...className.split(' '));
}
