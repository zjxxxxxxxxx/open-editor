import { checkValidElement } from '../utils/checkElement';
import { IS_CLIENT } from '../constants';
import { on } from '../event';

export const mouse = {
  outWindow: true,
  outBrowser: true,
  x: 0,
  y: 0,
};

export function getActiveElement() {
  if (mouse.outWindow || mouse.outBrowser) return null;
  const el = <HTMLElement | null>document.elementFromPoint(mouse.x, mouse.y);
  return checkValidElement(el) ? el : null;
}

if (IS_CLIENT) {
  on('DOMContentLoaded', () => {
    on(
      'mousemove',
      (e: PointerEvent) => {
        mouse.x = e.x;
        mouse.y = e.y;
      },
      {
        capture: true,
      },
    );

    on(
      'mouseout',
      (e: PointerEvent) => {
        const el = e.relatedTarget as HTMLElement;
        if (el) {
          mouse.outBrowser = false;
          mouse.outWindow = el.localName == null || el.localName === 'iframe';
        } else {
          mouse.outBrowser = true;
          mouse.outWindow = true;
        }
      },
      {
        capture: true,
      },
    );
  });
}
