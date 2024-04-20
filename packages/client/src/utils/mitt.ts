export function mitt<T extends (...args: any[]) => void>() {
  const fns = new Set<T>();
  return {
    get isEmpty() {
      return fns.size === 0;
    },
    on(fn: T) {
      fns.add(fn);
    },
    off(fn: T) {
      fns.delete(fn);
    },
    emit(...args: Parameters<T>) {
      fns.forEach((fn) => fn(...args));
    },
  };
}
