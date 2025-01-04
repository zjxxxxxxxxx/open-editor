export function mitt<Args extends unknown[] = []>() {
  const fns = new Set<(...args: Args) => void>();
  return {
    get isEmpty() {
      return fns.size === 0;
    },
    on(fn: (...args: Args) => void) {
      fns.add(fn);
    },
    once(fn: (...args: Args) => void) {
      const wrap = (...args: Args) => {
        fns.delete(wrap);
        fn(...args);
      };
      fns.add(wrap);
    },
    off(fn: (...args: Args) => void) {
      fns.delete(fn);
    },
    clear() {
      fns.clear();
    },
    emit(...args: Args) {
      fns.forEach((fn) => fn(...args));
    },
  };
}
