const empty_RAF = -1;

export function create_RAF<T extends (...args: any[]) => any>(callback: T) {
  let last_RAF = empty_RAF;
  return function call_RAF(...args: Parameters<T>) {
    if (last_RAF !== empty_RAF) {
      cancelAnimationFrame(last_RAF);
    }
    last_RAF = requestAnimationFrame(() => {
      last_RAF = empty_RAF;
      callback(...args);
    });
  };
}
