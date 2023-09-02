export function isFunc(value: any): value is () => void {
  return typeof value === 'function';
}

export function isObj(value: any): value is object {
  return value != null && typeof value === 'object';
}

export function isStr(value: any): value is string {
  return typeof value === 'string';
}

export function isNum(value: any): value is number {
  return typeof value === 'number';
}