export interface MittOptions<Args extends any[] = []> {
  onBefore?: (fn: (...args: Args) => any) => any;
  offAfter?: (fn: (...args: Args) => any) => any;
  emitMiddlewares?: ((args: Args, next: (...args: Args) => any) => any)[];
}

export function mitt<Args extends any[] = []>(options: MittOptions<Args> = {}) {
  const { onBefore, offAfter, emitMiddlewares } = options;
  const fns = new Set<(...args: Args) => any>();
  return {
    get isEmpty() {
      return fns.size === 0;
    },
    on(fn: (...args: Args) => any) {
      onBefore?.(fn);
      fns.add(fn);
    },
    off(fn: (...args: Args) => any) {
      fns.delete(fn);
      offAfter?.(fn);
    },
    emit(...args: Args) {
      if (emitMiddlewares?.length) {
        const stack = [
          ...emitMiddlewares,
          (args) => fns.forEach((fn) => fn(...args)),
        ];
        function next() {
          stack.shift()!(args, next);
        }
        next();
      } else {
        fns.forEach((fn) => fn(...args));
      }
    },
  };
}
