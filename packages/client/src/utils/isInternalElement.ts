import {
  HTML_OVERLAY_ELEMENT,
  HTML_POINTER_ELEMENT,
  HTML_ROOT_ELEMENT,
} from '../constants';

const internalElements = [
  HTML_ROOT_ELEMENT,
  HTML_OVERLAY_ELEMENT,
  HTML_POINTER_ELEMENT,
];

export function isInternalElement(element: HTMLElement) {
  return internalElements.includes(element.localName);
}
