import { on, off } from '../../utils/event';

const events = [
  'pointerup',
  'pointermove',
  'pointerdown',
  'longpress',
  'resize',
  'keydown',
  'wheel',
  'scroll',
];

export function createIdleObserver(duration: number) {
  let isIdle = false;
  let timer: number | null = null;

  function detect() {
    isIdle = false;

    if (timer != null) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      isIdle = true;
      timer = null;
    }, duration) as unknown as number;
  }

  return {
    get isIdle() {
      return isIdle;
    },
    start() {
      isIdle = false;
      events.forEach((event) => {
        on(event, detect, {
          capture: true,
        });
      });
    },
    stop() {
      isIdle = true;
      events.forEach((event) => {
        off(event, detect, {
          capture: true,
        });
      });
    },
  };
}
