import { omit } from '../util';
import {
  type SetupListenerListener,
  type SetupListenerListenerOptions,
  createCustomEvent,
} from './create';
import { off, on } from '.';

export default createCustomEvent('quickexit', setupListener);

function setupListener(
  listener: SetupListenerListener,
  opts: SetupListenerListenerOptions,
) {
  function setup() {
    on('keydown', trigger, omit(opts, 'target'));
    on('contextmenu', trigger, opts);

    return function clean() {
      off('keydown', trigger, omit(opts, 'target'));
      off('contextmenu', trigger, opts);
    };
  }

  function trigger(e: PointerEvent) {
    if (
      // esc exit.
      (<any>e).code === 'Escape' ||
      // right-click exit.
      e.type === 'contextmenu'
    ) {
      if (!e.type.startsWith('touch')) {
        e.preventDefault();
      }

      listener(e);
    }
  }

  return setup();
}
