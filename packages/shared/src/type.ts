export function isFn(value: any): value is () => void {
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

export function isBol(value: any): value is boolean {
  return typeof value === 'boolean';
}

export function isArr<Item = any>(value: any): value is Item[] {
  return Array.isArray(value);
}

export function isNaN(value: any) {
  return Number.isNaN(value);
}
