import { checkValidElement } from '../utils/checkElement';
import { mouse } from '../utils/mouse';

export function getActiveElement() {
  if (mouse.outWindow || mouse.outBrowser) return null;
  const el = <HTMLElement | null>document.elementFromPoint(mouse.x, mouse.y);
  return checkValidElement(el) ? el : null;
}
