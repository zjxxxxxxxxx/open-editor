import { InternalElements } from '../constants';

const internalElements: string[] = Object.values(InternalElements);
export function isInternalElement(element: HTMLElement) {
  return internalElements.includes(element.localName);
}
