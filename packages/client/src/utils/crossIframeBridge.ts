import { getOptions } from '../options';
import { mitt } from './mitt';

export interface CrossIframeBridgeOptions<Args extends unknown[] = []> {
  setup?: () => void;
  emitMiddlewares?: CrossIframeBridgeMiddleware<Args>[];
}

export type CrossIframeBridgeMiddleware<Args extends unknown[] = []> = (
  args: Args,
  next: () => void,
) => void;

export function crossIframeBridge<Args extends unknown[] = []>(
  opts: CrossIframeBridgeOptions<Args> = {},
) {
  const { setup, emitMiddlewares = [] } = opts;
  const bridge = mitt<Args>();

  let inited = false;

  return {
    ...bridge,
    get isEmpty() {
      return bridge.isEmpty;
    },
    setup() {
      const { crossIframe } = getOptions();
      if (crossIframe && !inited) {
        inited = true;
        setup?.();
      }
    },
    emit(args?: Args, immediate?: boolean) {
      if (!Array.isArray(args)) {
        args = [] as unknown as Args;
      }

      const { crossIframe } = getOptions();
      const stack: CrossIframeBridgeMiddleware<Args>[] = [() => bridge.emit(...args!)];

      if (crossIframe && !immediate && emitMiddlewares.length) {
        stack.unshift(...emitMiddlewares);
      }

      (function next() {
        stack.shift()!(args!, next);
      })();
    },
  };
}
