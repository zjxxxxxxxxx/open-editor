import { omit } from '@open-editor/shared';
import {
  type SetupListenerListener,
  type SetupListenerListenerOptions,
  createCustomEventHandler,
} from './create';
import { off, on } from '.';

export default createCustomEventHandler('quickexit', setupListener);

function setupListener(
  listener: SetupListenerListener,
  opts: SetupListenerListenerOptions,
) {
  function setup() {
    on('keydown', trigger, omit(opts, 'target'));
    on('contextmenu', trigger, opts);

    return clean;
  }

  function clean() {
    off('keydown', trigger, omit(opts, 'target'));
    off('contextmenu', trigger, opts);
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
