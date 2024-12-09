import { hasOwnProperty } from '@open-editor/shared';
import { IS_CLIENT, IS_FIREFOX } from '../constants';
import { createStyleGetter } from './dom';

/**
 * In most browsers, the return value of [getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
 * does not calculate [zoom](https://developer.mozilla.org/en-US/docs/Web/CSS/zoom),
 * causing the obtained value to be inconsistent with the actual size of the element.
 * Additional calculation is required to solve this problem.
 */
const IS_COMPUTED =
  IS_CLIENT &&
  hasOwnProperty(document.body.style, 'zoom') &&
  // Firefox does not need to calculate
  !IS_FIREFOX &&
  // Chromium version greater than 127 do not need to be calculated
  // @ts-ignore
  !navigator.userAgentData?.brands.find((i) => i.brand === 'Chromium' && +i.version > 127);

export function getDOMRect(target: HTMLElement): Omit<DOMRectReadOnly, 'toJSON'> {
  const domRect = target.getBoundingClientRect().toJSON();
  if (IS_COMPUTED) {
    return computedDOMRect(target, domRect);
  }
  return domRect;
}

function computedDOMRect(target: HTMLElement, domRect: DOMRect) {
  const zoom = getCompositeZoom(target);
  if (zoom !== 1) {
    Object.keys(domRect).forEach((key) => (domRect[key] *= zoom));
  }
  return domRect;
}

export function getCompositeZoom(target: HTMLElement) {
  let zoom = 1;
  while (target) {
    zoom *= createStyleGetter(target)('zoom');
    target = target.parentElement!;
  }
  return zoom;
}
