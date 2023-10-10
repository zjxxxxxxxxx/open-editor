import { CSS_util } from './document';

export function createStyleGetter(element: Element) {
  const style = window.getComputedStyle(element, null);
  return function styleValueGetter(property: string) {
    return CSS_util.pv(style.getPropertyValue(property)) || 0;
  };
}
