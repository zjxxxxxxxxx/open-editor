import { IS_CLIENT } from '../constants';

/**
 * This is a virtual top window of the same origin, which is used to achieve cross-iframe
 * interaction under the same origin. It is not the real top window of the browser.
 */
export const topWindow = IS_CLIENT ? getTopWindow() : undefined;
export const isTopWindow = IS_CLIENT && topWindow === window;

function getTopWindow() {
  let current: Window = window;
  while (current.frameElement) {
    current = current.parent;
  }
  return current;
}
