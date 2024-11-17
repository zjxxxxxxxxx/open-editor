export interface MittOptions<Args extends any[] = []> {
  onBefore?: (fn: (...args: Args) => any) => any;
  offAfter?: (fn: (...args: Args) => any) => any;
  emitMiddlewares?: ((
    args: Args,
    next: () => any,
    formTopWindow?: boolean,
  ) => any)[];
}

export function mitt<Args extends any[] = []>(options: MittOptions<Args> = {}) {
  const { onBefore, offAfter, emitMiddlewares } = options;
  const fns = new Set<(...args: Args) => any>();
  return {
    get isEmpty() {
      return fns.size === 0;
    },
    on(fn: (...args: Args) => any) {
      if (fns.size === 0) {
        onBefore?.(fn);
      }
      fns.add(fn);
    },
    off(fn: (...args: Args) => any) {
      fns.delete(fn);
      if (fns.size === 0) {
        offAfter?.(fn);
      }
    },
    emit(args?: Args, formTopWindow?: boolean) {
      if (!Array.isArray(args)) {
        args = [] as unknown as Args;
      }
      if (emitMiddlewares?.length) {
        const stack = [
          ...emitMiddlewares,
          () => fns.forEach((fn) => fn(...args!)),
        ];
        function next() {
          stack.shift()!(args!, next, formTopWindow);
        }
        next();
      } else {
        fns.forEach((fn) => fn(...args!));
      }
    },
  };
}
