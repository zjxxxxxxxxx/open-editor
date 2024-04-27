export function isFn(value: any): value is () => void {
  return typeof value === 'function';
}

export function isObj<R extends object = AnyObject>(value: any): value is R {
  return value != null && typeof value === 'object';
}

export function isStr<R extends string = string>(value: any): value is R {
  return typeof value === 'string';
}

export function isNum<R extends number = number>(value: any): value is R {
  return typeof value === 'number';
}

export function isBol<R extends boolean = boolean>(value: any): value is R {
  return typeof value === 'boolean';
}

export function isArr<R extends any[] = any[]>(value: any): value is R {
  return Array.isArray(value);
}

export function isNaN(value: any) {
  return Number.isNaN(value);
}
