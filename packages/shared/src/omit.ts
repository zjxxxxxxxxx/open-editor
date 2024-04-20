import { hasOwnProperty } from './hasOwnProperty';

export function omit<T extends AnyObject, K extends keyof T>(
  val: T,
  ...keys: K[]
): Omit<T, K> {
  const newVal = { ...val };
  for (const key of keys) {
    if (hasOwnProperty(val, key)) delete newVal[key];
  }
  return newVal;
}
