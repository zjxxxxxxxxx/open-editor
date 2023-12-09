import { InternalElements } from '../constants';

const internals: string[] = Object.values(InternalElements);
function isInternalElement(el: HTMLElement) {
  return internals.includes(el.localName);
}

const filters = [
  // The `html` check is triggered when the mouse leaves the browser,
  // and filtering is needed to ignore this unexpected check.
  // 'html',
  // `iframe` should be left to the internal inspector.
  'iframe',
];
function isFilterElement(el: HTMLElement) {
  return filters.includes(el.localName);
}

export function isValidElement(el: HTMLElement | null): el is HTMLElement {
  return (
    el != null &&
    el.isConnected &&
    !isInternalElement(el) &&
    !isFilterElement(el)
  );
}
