import { InternalElements } from '../constants';

const internalElements = Object.values(InternalElements);
export function isInternalElement(element: HTMLElement) {
  return internalElements.includes(element.localName);
}
