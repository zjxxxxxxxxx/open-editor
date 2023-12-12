import { Fragment } from '../../../jsx/jsx-runtime';
import { computedStyle } from './style';

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

export function getDOMRect(target: HTMLElement): Omit<DOMRect, 'toJSON'> {
  const domRect = target.getBoundingClientRect().toJSON();
  const zoom = computedStyle(target)('zoom');
  // In browsers that do not support zoom, zoom is always empty.
  if (zoom !== 0 && zoom !== 1) {
    Object.keys(domRect).forEach((key) => (domRect[key] *= zoom));
  }
  return domRect;
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

export function resetChildren(
  el: HTMLElement | ShadowRoot,
  ...children: HTMLElement[]
) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
  appendChild(el, ...children);
}
