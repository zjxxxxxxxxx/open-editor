import { on, off } from './index';
import {
  type SetupListenerListener,
  type SetupListenerListenerOptions,
  createCustomEventHandler,
} from './create';

export default createCustomEventHandler('rightclick', setupListener);

function setupListener(
  listener: SetupListenerListener,
  opts: SetupListenerListenerOptions,
) {
  function setup() {
    on('contextmenu', trigger, opts);

    return clean;
  }

  function clean() {
    off('contextmenu', trigger, opts);
  }

  function trigger(e: PointerEvent) {
    e.preventDefault();

    // The contextmenu event triggered only by the mouse is a rightclick event
    if (e.pointerType === 'mouse') {
      listener(e);
    }
  }

  return setup();
}
