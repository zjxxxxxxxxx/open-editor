import { IS_CLIENT } from '../constants';

export const topWindow = IS_CLIENT ? getTopWindow() : undefined;
export const isTopWindow = IS_CLIENT && topWindow === window;

function getTopWindow() {
  let current: Window = window;
  while (current.frameElement) {
    current = current.parent;
  }
  return current;
}
