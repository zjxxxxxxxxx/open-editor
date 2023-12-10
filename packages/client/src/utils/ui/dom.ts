import { Fragment } from '../../../jsx/jsx-runtime';
import { computedStyle } from './style';

export function getHtml() {
  return document.documentElement;
}

export function applyAttrs(el: HTMLElement, attrs: Record<string, unknown>) {
  for (const property of Object.keys(attrs)) {
    const attr = attrs[property];
    // support '' | 0 | false
    if (attr != null) {
      el.setAttribute(property, String(attr));
    } else {
      el.removeAttribute(property);
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

export function append(
  parent: HTMLElement | ShadowRoot,
  ...children: HTMLElement[]
) {
  for (const child of children) {
    if (child.tagName === Fragment) {
      // @ts-ignore
      append(parent, ...child.children);
    } else {
      parent.appendChild(child);
    }
  }
}
