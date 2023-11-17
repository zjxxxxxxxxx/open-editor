import { InternalElements } from '../constants';

const internalElementRE = new RegExp(
  `^(${Object.values(InternalElements).join('|')})$`,
);
function isInternalElement(el: HTMLElement) {
  return internalElementRE.test(el.localName);
}

const filterElementRE = /^(html|iframe)$/;
function isFilterElement(el: HTMLElement) {
  return filterElementRE.test(el.localName);
}

export function isValidElement(el: HTMLElement) {
  return !isInternalElement(el) && !isFilterElement(el);
}
