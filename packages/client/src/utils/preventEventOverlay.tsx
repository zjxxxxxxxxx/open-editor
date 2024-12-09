import { off, on } from '../event';
import { getOptions } from '../options';
import { appendChild } from './dom';
import { isTopWindow } from './topWindow';

let unmount: () => void;

export const preventEventOverlay = {
  mount() {
    const { once } = getOptions();

    const overlay = <div className="oe-prevent-event-overlay" />;
    const eventOpts = {
      target: once ? overlay : window,
      capture: true,
    };

    unmount = () => {
      off('pointerdown', unmount, eventOpts);
      off('pointerup', unmount, eventOpts);
      off('pointerout', unmount, eventOpts);

      if (isTopWindow) {
        off('pointermove', unmount, eventOpts);
      }

      overlay.remove();
    };

    on('pointerdown', unmount, eventOpts);
    on('pointerup', unmount, eventOpts);
    on('pointerout', unmount, eventOpts);

    if (isTopWindow) {
      on('pointermove', unmount, eventOpts);
    }

    appendChild(document.body, overlay);
  },
  unmount() {
    unmount?.();
  },
};
