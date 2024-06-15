import { CLIENT } from '../constants';
import { on } from '../event';

export function createMouseWatcher() {
  const mouse = {
    x: 0,
    y: 0,
  };

  if (CLIENT) {
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
    });
  }

  return mouse;
}
