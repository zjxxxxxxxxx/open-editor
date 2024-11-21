import { checkValidElement } from '../utils/checkElement';
import { IS_CLIENT } from '../constants';
import { on } from '../event';
import { inspectorState } from './inspectorState';

const mouse = {
  outBrowser: false,
  x: 0,
  y: 0,
};

export function getActiveElement() {
  if (!inspectorState.isActive || mouse.outBrowser) {
    return null;
  }

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
        mouse.outBrowser = e.relatedTarget == null;
      },
      {
        capture: true,
      },
    );
  });
}
