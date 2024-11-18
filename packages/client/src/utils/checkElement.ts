import { HTML_INSPECT_ELEMENT } from '../constants';
import { getOptions } from '../options';

const INVALID_ELEMEN_TCROSS_IFRAME = [HTML_INSPECT_ELEMENT];

const INVALID_ELEMENT = [
  ...INVALID_ELEMEN_TCROSS_IFRAME,
  // In Firefox, when the mouse leaves the visual area, the event target is `HTMLDocument`.
  undefined,
  // The `html` check is triggered when the mouse leaves the browser,
  // and filtering is needed to ignore this unexpected check.
  'html',
  // `iframe` should be left to the internal inspector.
  'iframe',
];

export function checkValidElement(el: HTMLElement | null): el is HTMLElement {
  if (el == null || !el.isConnected) {
    return false;
  }

  const { crossIframe } = getOptions();
  if (crossIframe) {
    return !INVALID_ELEMEN_TCROSS_IFRAME.includes(el.localName);
  }
  return !INVALID_ELEMENT.includes(el.localName);
}
