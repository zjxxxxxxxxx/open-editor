import { Fragment } from '../../jsx/jsx-runtime';
import { CLIENT, InternalElements } from '../constants';

const internals = Object.values(InternalElements).map((internal) =>
  internal.toUpperCase(),
);
export function checkInternalElement(
  el: HTMLElement | null,
): el is HTMLElement {
  return el != null && internals.includes(el.nodeName);
}

const invalids = [
  ...internals,
  // In Firefox, when the mouse leaves the visual area, the event target is `HTMLDocument`.
  '#document',
  // The `html` check is triggered when the mouse leaves the browser,
  // and filtering is needed to ignore this unexpected check.
  'HTML',
  // `iframe` should be left to the internal inspector.
  'IFRAME',
];
export function checkValidElement(el: HTMLElement | null): el is HTMLElement {
  return el != null && el.isConnected && !invalids.includes(el.nodeName);
}

export function getHtml() {
  return document.documentElement;
}

export function getDOMRect(target: HTMLElement): Omit<DOMRect, 'toJSON'> {
  const domRect = target.getBoundingClientRect().toJSON();

  let zoom = 1;
  while (target) {
    zoom *= computedStyle(target)('zoom');
    target = target.parentElement!;
  }

  // In browsers that do not support zoom, zoom is always empty.
  if (zoom !== 0 && zoom !== 1) {
    Object.keys(domRect).forEach((key) => (domRect[key] *= zoom));
  }
  return domRect;
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

export function appendChild(
  el: HTMLElement | ShadowRoot,
  ...children: HTMLElement[]
) {
  for (const child of children) {
    if (child.tagName === Fragment) {
      // @ts-ignore
      appendChild(el, ...child.children);
    } else {
      el.appendChild(child);
    }
  }
}

export function replaceChildren(
  el: HTMLElement | ShadowRoot,
  ...children: HTMLElement[]
) {
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

export function createGlobalStyle(css: string) {
  if (!CLIENT) return { mount() {}, unmount() {} };

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
