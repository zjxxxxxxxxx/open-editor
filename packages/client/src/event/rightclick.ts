import {
  type SetupDispatcherListener,
  type SetupDispatcherListenerOptions,
  createCustomEventDispatcher,
} from './create';
import { on, off } from '.';

export default createCustomEventDispatcher('rightclick', setupRightclickDispatcher);

function setupRightclickDispatcher(
  listener: SetupDispatcherListener,
  opts: SetupDispatcherListenerOptions,
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
    if (e.pointerType == null || e.pointerType === 'mouse') {
      listener(e);
    }
  }

  return setup();
}
