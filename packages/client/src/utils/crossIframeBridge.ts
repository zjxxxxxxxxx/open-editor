import { getOptions } from '../options';
import { mitt } from './mitt';

export interface CrossIframeBridgeOptions<Args extends unknown[] = []> {
  setup?: () => void;
  emitMiddlewares?: ((args: Args, next: () => void) => void)[];
}

export function crossIframeBridge<Args extends unknown[] = []>(
  opts: CrossIframeBridgeOptions<Args> = {},
) {
  const { setup, emitMiddlewares } = opts;
  const mitter = mitt<Args>();

  let init = false;

  return {
    ...mitter,
    setup() {
      const { crossIframe } = getOptions();
      if (crossIframe && !init) {
        init = true;
        setup?.();
      }
    },
    emit(args?: Args, immediate?: boolean) {
      if (!Array.isArray(args)) {
        args = [] as unknown as Args;
      }

      const { crossIframe } = getOptions();
      if (crossIframe && !immediate && emitMiddlewares?.length) {
        const stack = [...emitMiddlewares, () => mitter.emit(...args!)];
        (function next() {
          stack.shift()!(args!, next);
        })();
      } else {
        mitter.emit(...args!);
      }
    },
  };
}
