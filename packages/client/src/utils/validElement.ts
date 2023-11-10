import { InternalElements } from '../constants';

const internalElementRE = new RegExp(
  `^(${Object.values(InternalElements).join('|')})$`,
);
function isInternalElement(element: HTMLElement) {
  return internalElementRE.test(element.localName);
}

const filterElementRE = /^(html|iframe)$/;
function isFilterElement(element: HTMLElement) {
  return filterElementRE.test(element.localName);
}

export function isValidElement(element: HTMLElement) {
  return !isInternalElement(element) && !isFilterElement(element);
}
