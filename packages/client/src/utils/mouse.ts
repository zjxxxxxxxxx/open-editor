import { IS_CLIENT } from '../constants';
import { on } from '../event';

export const mouse = {
  outWindow: true,
  outBrowser: false,
  x: 0,
  y: 0,
};

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
