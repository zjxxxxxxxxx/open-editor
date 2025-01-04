import {
  type SetupListenerListener,
  type SetupListenerListenerOptions,
  createCustomEventHandler,
} from './create';
import { off, on } from '.';

export default createCustomEventHandler('quickexit', setupListener);

function setupListener(listener: SetupListenerListener, opts: SetupListenerListenerOptions) {
  function setup() {
    on('keydown', trigger, {
      ...opts,
      target: window,
    });
    on('rightclick', trigger, opts);

    return clean;
  }

  function clean() {
    off('keydown', trigger, {
      ...opts,
      target: window,
    });
    off('rightclick', trigger, opts);
  }

  function trigger(e: PointerEvent) {
    if (
      // esc exit.
      (<any>e).code === 'Escape' ||
      // right-click exit.
      e.type === 'rightclick'
    ) {
      e.preventDefault();
      listener(e);
    }
  }

  return setup();
}
