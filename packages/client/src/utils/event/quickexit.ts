import {
  type CustomEventOptions,
  type CustomEventListener,
  createCustomEvent,
} from './createCustomEvent';
import { off, on } from '.';

export default createCustomEvent('quickexit', setupListener);

function setupListener(
  listener: CustomEventListener,
  rawOpts: CustomEventOptions,
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { target, ...opts } = rawOpts;

  function setup() {
    on('keydown', trigger, opts);
    on('contextmenu', trigger, rawOpts);

    return () => {
      off('keydown', trigger, opts);
      off('contextmenu', trigger, rawOpts);
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
