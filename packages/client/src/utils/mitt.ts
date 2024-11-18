export function mitt<Args extends unknown[] = []>() {
  const fns = new Set<(...args: Args) => void>();
  const mitter = {
    get isEmpty() {
      return fns.size === 0;
    },
    on(fn: (...args: Args) => void) {
      fns.add(fn);
    },
    once(fn: (...args: Args) => void) {
      const once = (...args: Args) => {
        mitter.off(once);
        fn(...args);
      };
      mitter.on(once);
    },
    off(fn: (...args: Args) => void) {
      fns.delete(fn);
    },
    emit(...args: Args) {
      fns.forEach((fn) => fn(...args));
    },
  };
  return mitter;
}
