import { InternalElements } from '../constants';

const INTERNAL_ELEMENT = Object.values(InternalElements).map((internal) =>
  internal.toUpperCase(),
);
const INVALID_ELEMENT = [
  ...INTERNAL_ELEMENT,
  // In Firefox, when the mouse leaves the visual area, the event target is `HTMLDocument`.
  '#document',
  // The `html` check is triggered when the mouse leaves the browser,
  // and filtering is needed to ignore this unexpected check.
  'HTML',
  // `iframe` should be left to the internal inspector.
  'IFRAME',
];

export function checkInternalElement(
  el: HTMLElement | null,
): el is HTMLElement {
  return el != null && INTERNAL_ELEMENT.includes(el.nodeName);
}

export function checkValidElement(el: HTMLElement | null): el is HTMLElement {
  return el != null && el.isConnected && !INVALID_ELEMENT.includes(el.nodeName);
}
