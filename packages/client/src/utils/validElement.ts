import { InternalElements } from '../constants';

const internalElementRE = new RegExp(
  `^(${Object.values(InternalElements).join('|')})$`,
);
function isInternalElement(el: HTMLElement) {
  return internalElementRE.test(el.localName);
}

function isFilterElement(el: HTMLElement) {
  return el.localName === 'iframe';
}

export function isValidElement(el?: HTMLElement | null) {
  return !!el && !isInternalElement(el) && !isFilterElement(el);
}
