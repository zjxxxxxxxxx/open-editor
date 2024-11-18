import { mitt } from './mitt';

export interface BridgeOptions<Args extends unknown[] = []> {
  setup?: () => void;
  emitMiddlewares?: ((
    args: Args,
    next: () => void,
    formTopWindow?: boolean,
  ) => void)[];
}

export function bridge<Args extends unknown[] = []>(
  opts: BridgeOptions<Args> = {},
) {
  const { setup, emitMiddlewares } = opts;
  const mitter = mitt<Args>();

  let init = false;

  return {
    ...mitter,
    setup() {
      if (!init) {
        init = true;
        setup?.();
      }
    },
    emit(args?: Args, formTopWindow?: boolean) {
      if (!Array.isArray(args)) {
        args = [] as unknown as Args;
      }
      if (emitMiddlewares?.length) {
        const stack = [...emitMiddlewares, () => mitter.emit(...args!)];
        function next() {
          stack.shift()!(args!, next, formTopWindow);
        }
        next();
      } else {
        mitter.emit(...args!);
      }
    },
  };
}
