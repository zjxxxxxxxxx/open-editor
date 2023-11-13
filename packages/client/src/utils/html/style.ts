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
  return function get<ToNumber extends boolean = true>(
    property: string,
    // @ts-ignore
    toNumber: ToNumber = true,
  ) {
    const value = style.getPropertyValue(property);
    if (toNumber) {
      const valueNumber = CSS_util.pv(value);
      return <ToNumber extends true ? number : string>(
        (isNaN(valueNumber) ? 0 : valueNumber)
      );
    }
    return <ToNumber extends true ? number : string>value;
  };
}

export function globalStyle(css: string, defaultInsert = false) {
  const style = jsx('style', {
    type: 'text/css',
    __html: css,
  });
  let inserted = false;

  function insert() {
    if (!inserted) {
      inserted = true;
      append(document.body, style);
    }
  }

  function remove() {
    if (inserted) {
      inserted = false;
      style.remove();
    }
  }

  if (defaultInsert) {
    insert();
  }

  return {
    insert,
    remove,
  };
}

export function addClass(element: HTMLElement, ...classNames: string[]) {
  element.classList.add(...classNames);
}

export function reomveClass(element: HTMLElement, ...classNames: string[]) {
  element.classList.remove(...classNames);
}
