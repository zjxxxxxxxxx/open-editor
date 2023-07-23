export function applyStyle(
  element: HTMLElement,
  style: Partial<CSSStyleDeclaration>,
) {
  Object.assign(element.style, style);
}

export function applyAttribute(
  element: HTMLElement,
  attribute: Record<string, unknown>,
) {
  for (const property of Object.keys(attribute)) {
    const value = attribute[property];
    if (value != null) {
      element.setAttribute(property, String(value));
    } else {
      element.removeAttribute(property);
    }
  }
}
