import { on, off } from '../event';

const events = [
  'pointerup',
  'pointermove',
  'pointerdown',
  'resize',
  'keydown',
  'wheel',
];

export type IdleObserver = ReturnType<typeof createIdleObserver>;

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

  function visibilityChange() {
    isIdle = document.hidden;
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
      on('visibilitychange', visibilityChange, {
        target: document,
      });
    },
    stop() {
      isIdle = true;
      events.forEach((event) => {
        off(event, detect, {
          capture: true,
        });
      });
      off('visibilitychange', visibilityChange, {
        target: document,
      });
    },
  };
}
