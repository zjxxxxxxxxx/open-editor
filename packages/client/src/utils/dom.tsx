import { Fragment } from '../../jsx/jsx-runtime';

export function getHtml() {
  return document.documentElement;
}

export function applyAttrs(el: HTMLElement, attrs: AnyObject) {
  for (const prop of Object.keys(attrs)) {
    const val = attrs[prop];
    // support '' | 0 | false
    if (val != null) {
      el.setAttribute(prop, val);
    } else {
      el.removeAttribute(prop);
    }
  }
}

export function appendChild(el: HTMLElement | ShadowRoot, ...children: HTMLElement[]) {
  for (const child of children) {
    if (child.tagName === Fragment) {
      // @ts-ignore
      appendChild(el, ...child.children);
    } else {
      el.appendChild(child);
    }
  }
}

export function replaceChildren(el: HTMLElement | ShadowRoot, ...children: HTMLElement[]) {
  // Unable to handle automatic elimination of Fragment element.
  // if (el.replaceChildren) {
  //   return el.replaceChildren(...children);
  // }

  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
  appendChild(el, ...children);
}

/**
 * Check element visibility
 *
 * There are differences between the polyfill here and the official draft.
 * The draft stipulates that `visibility: hidden` is visible and `content-visibility: hidden` is invisible,
 * but we think they should have the same meaning, that is, both are visible. ,
 * or both are invisible, we chose to make them both visible.
 *
 * @see [dom-element-checkvisibility](https://drafts.csswg.org/cssom-view-1/#dom-element-checkvisibility)
 */
export function checkVisibility(el: HTMLElement) {
  if (!el.isConnected) {
    return false;
  }

  // if (el.checkVisibility) {
  //   return el.checkVisibility();
  // }

  while (el) {
    const get = computedStyle(el);
    if (get('display', false) === 'none') {
      return false;
    }
    el = el.parentElement!;
  }
  return true;
}

export const CSS_util = {
  px(value: string | number) {
    return `${value}px`;
  },
  pv(value: string) {
    return Number.parseFloat(value);
  },
  translate(x: number, y: number) {
    return `translate(${CSS_util.px(x)}, ${CSS_util.px(y)})`;
  },
};

export function applyStyle(
  el: HTMLElement,
  ...styles: {
    [P in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[P] | null;
  }[]
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

export function addClass(el: HTMLElement, className: string) {
  el.classList.add(...className.split(' '));
}

export function removeClass(el: HTMLElement, className: string) {
  el.classList.remove(...className.split(' '));
}
