export function clamp(val: number, start: number, end: number) {
  return Math.min(Math.max(val, start), end);
}

export function omit<T extends AnyObject, K extends keyof T>(
  val: T,
  ...keys: K[]
): Omit<T, K> {
  const newVal = { ...val };
  for (const key of keys) {
    if (key in val) delete newVal[key];
  }
  return newVal;
}

const upperCaseRE = /((?=^)|([./\-_]+))([a-z])/g;
export function upperCase(str: string) {
  return str.replace(upperCaseRE, (...s) => s[3].toUpperCase());
}
