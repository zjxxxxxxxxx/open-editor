import { getOptions } from '../../options';
import { on, off } from '../../utils/event';

const events = [
  'pointermove',
  'pointerdown',
  'longpress',
  'resize',
  'keydown',
  'wheel',
];

export function createIdle(duration: number) {
  const { realtimeFrame } = getOptions();
  let idle = false;
  let timer: number | null = null;

  function onEvent() {
    idle = false;

    if (timer != null) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      idle = true;
      timer = null;
    }, duration) as unknown as number;
  }

  return {
    get value() {
      return idle;
    },
    start() {
      if (!realtimeFrame) {
        idle = false;
        events.forEach((event) => on(event, onEvent, { capture: true }));
      }
    },
    stop() {
      if (!realtimeFrame) {
        idle = true;
        events.forEach((event) => off(event, onEvent, { capture: true }));
      }
    },
  };
}
