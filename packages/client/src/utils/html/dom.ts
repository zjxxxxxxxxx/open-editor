import { createStyleGetter } from './style';

export function append(parent: Node, ...children: Node[]) {
  for (const child of children) {
    parent.appendChild(child);
  }
}

export function applyAttrs(
  element: HTMLElement,
  attrs: Record<string, unknown>,
) {
  for (const property of Object.keys(attrs)) {
    const attr = attrs[property];
    // support '' | 0 | false
    if (attr != null) {
      element.setAttribute(property, String(attr));
    } else {
      element.removeAttribute(property);
    }
  }
}

export function getDOMRect(target: Element): Omit<DOMRect, 'toJSON'> {
  const domRect = target.getBoundingClientRect().toJSON();

  const zoom = createStyleGetter(target)('zoom');
  if (zoom && zoom !== 1) {
    Object.keys(domRect).forEach((key) => (domRect[key] *= zoom));
  }

  return domRect;
}

export function getHtml() {
  return document.documentElement;
}
