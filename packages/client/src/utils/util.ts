export function clamp(val: number, start: number, end: number) {
  return Math.min(Math.max(val, start), end);
}

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

const upperCaseRE = /((?=^)|([./\-_]+))([a-z])/g;
export function upperCase(str: string) {
  return str.replace(upperCaseRE, (...s) => s[3].toUpperCase());
}

export function hasOwnProperty<Obj extends object, Prop extends PropertyKey>(
  obj: Partial<Obj>,
  prop: Prop,
): obj is Obj & Record<Prop, Prop extends keyof Obj ? Obj[Prop] : any> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
