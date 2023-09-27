import { InternalElements } from '../constants';

const internalElementRE = new RegExp(
  `^(${Object.values(InternalElements).join('|')})$`,
);
export function isInternalElement(element: HTMLElement) {
  return internalElementRE.test(element.localName);
}

const filterElementRE = /^(html|body|iframe)$/;
export function isFilterElement(element: HTMLElement) {
  return filterElementRE.test(element.localName);
}

export function isValidElement(element: HTMLElement) {
  return !isInternalElement(element) && !isFilterElement(element);
}
