import { HTML_INSPECT_ELEMENT } from '../constants';

const INVALID_ELEMENT = [
  HTML_INSPECT_ELEMENT,
  // In Firefox, when the mouse leaves the visual area, the event target is `HTMLDocument`.
  undefined,
  // The `html` check is triggered when the mouse leaves the browser,
  // and filtering is needed to ignore this unexpected check.
  'html',
  // `iframe` should be left to the internal inspector.
  'iframe',
];

export function checkInternalElement(
  el: HTMLElement | null,
): el is HTMLElement {
  return el != null && el.nodeName === HTML_INSPECT_ELEMENT;
}

export function checkValidElement(el: HTMLElement | null): el is HTMLElement {
  return (
    el != null && el.isConnected && !INVALID_ELEMENT.includes(el.localName)
  );
}
