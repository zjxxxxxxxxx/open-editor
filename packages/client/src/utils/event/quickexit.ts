import {
  type CustomEventOptions,
  type CustomEventListener,
  createCustomEvent,
} from './createCustomEvent';
import { off, on } from '.';

export default createCustomEvent('quickexit', setupListener);

function setupListener(
  listener: CustomEventListener,
  opts: CustomEventOptions,
) {
  function setup() {
    on('keydown', trigger, opts);
    on('contextmenu', trigger, opts);

    return () => {
      off('keydown', trigger, opts);
      off('contextmenu', trigger, opts);
    };
  }

  function trigger(e: PointerEvent) {
    if (
      // esc exit.
      (<any>e).key === 'Escape' ||
      // right-click exit.
      e.type === 'contextmenu' ||
      // self
      e.type === 'quickexit'
    ) {
      if (!e.type.startsWith('touch')) {
        e.preventDefault();
      }

      listener(e);
    }
  }

  return setup();
}
