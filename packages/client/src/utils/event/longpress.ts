import {
  type SetupListenerListener,
  type SetupListenerListenerOptions,
  createCustomEvent,
} from './create';
import { off, on } from '.';

export default createCustomEvent('longpress', setupListener);

function setupListener(
  listener: SetupListenerListener,
  opts: SetupListenerListenerOptions<{
    wait?: number;
  }>,
) {
  const { wait = 300 } = opts;

  function setup() {
    on('pointerdown', start, opts);
    on('pointermove', stop, opts);
    on('pointerup', stop, opts);
    on('pointercancel', stop, opts);

    return function clean() {
      off('pointerdown', start, opts);
      off('pointermove', stop, opts);
      off('pointerup', stop, opts);
      off('pointercancel', stop, opts);
    };
  }

  let waitTimer: number | null = null;

  function start(e: PointerEvent) {
    // Left Mouse, Touch Contact, Pen contact
    // see: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events#determining_button_states
    if (e.button === 0 && e.buttons === 1) {
      waitTimer = setTimeout(() => {
        // Give the user a vibration prompt when entering the draggable state.
        // There are huge compatibility issues, so leave it to chance.
        // See: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate
        navigator.vibrate?.(15);

        listener(e);
      }, wait) as unknown as number;
    }
  }

  function stop() {
    if (waitTimer != null) {
      clearTimeout(waitTimer);
      waitTimer = null;
    }
  }

  return setup();
}
