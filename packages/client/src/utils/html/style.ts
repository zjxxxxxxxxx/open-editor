import { isNaN } from '@open-editor/shared';
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

export function computedStyle(element: Element) {
  const style = window.getComputedStyle(element, null);
  return function get<
    ToNumber extends boolean = true,
    ReturnValue = ToNumber extends true ? number : string,
  >(
    property: string,
    // @ts-ignore
    toNumber: ToNumber = true,
  ) {
    const value = style.getPropertyValue(property);
    if (toNumber) {
      const valueNumber = CSS_util.pv(value);
      return <ReturnValue>(isNaN(valueNumber) ? 0 : valueNumber);
    }
    return <ReturnValue>value;
  };
}

export function globalStyle(css: string, defaultMount = false) {
  const style = jsx('style', {
    type: 'text/css',
    __html: css,
  });

  let isMounted = false;
  const mount = () => {
    if (!isMounted) {
      isMounted = true;
      append(document.body, style);
    }
  };
  const unmount = () => {
    if (isMounted) {
      isMounted = false;
      style.remove();
    }
  };

  if (defaultMount) {
    mount();
  }

  return {
    mount,
    unmount,
  };
}

export function addClass(element: HTMLElement, ...classNames: string[]) {
  element.classList.add(...classNames);
}

export function reomveClass(element: HTMLElement, ...classNames: string[]) {
  element.classList.remove(...classNames);
}
