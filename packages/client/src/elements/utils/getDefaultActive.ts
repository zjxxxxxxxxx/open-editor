import { createMouseWatcher } from '../../utils/createMouseWatcher';
import { checkValidElement } from '../../utils/dom';

const mouse = createMouseWatcher();

export function getDefaultActive() {
  const el = <HTMLElement | null>document.elementFromPoint(mouse.x, mouse.y);
  return checkValidElement(el) ? el : null;
}
