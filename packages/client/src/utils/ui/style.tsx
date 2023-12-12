import { appendChild } from './dom';

type PartialWithNull<T> = { [P in keyof T]?: T[P] | undefined | null };

export const CSS_util = {
  px(value: string | number) {
    return `${value}px`;
  },
  pv(value: string) {
    return parseInt(value, 10);
  },
};

export function applyStyle(
  el: HTMLElement,
  ...styles: PartialWithNull<CSSStyleDeclaration>[]
) {
  Object.assign(el.style, ...styles);
}

export function computedStyle(el: HTMLElement) {
  const style = window.getComputedStyle(el, null);
  return function get<
    ToNumber extends boolean = true,
    ReturnValue = ToNumber extends true ? number : string,
  >(
    property: string,
    // @ts-ignore
    toNumber: ToNumber = true,
  ) {
    let value = style.getPropertyValue(property);
    // @ts-ignore
    if (toNumber) value = CSS_util.pv(value) || 0;
    return value as ReturnValue;
  };
}

export function globalStyle(css: string) {
  const style = <style type="text/css">{css}</style>;
  return {
    mount: () => !style.isConnected && appendChild(document.head, style),
    unmount: () => style.isConnected && style.remove(),
  };
}

export function addClass(el: HTMLElement, className: string) {
  el.classList.add(...className.split(' '));
}

export function removeClass(el: HTMLElement, className: string) {
  el.classList.remove(...className.split(' '));
}
