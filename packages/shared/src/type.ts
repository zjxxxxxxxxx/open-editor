/**
 * 类型判断工具函数集合
 * 使用类型谓词(Type Predicates)帮助TypeScript缩小变量类型范围
 */

/**
 * 判断是否为函数类型
 * @param value - 需要判断的任意值
 * @returns 类型谓词，返回true时表示value是函数类型 () => void
 * @example
 * isFn(() => {});    // true
 * isFn({});          // false
 */
export function isFn(value: any): value is () => void {
  return typeof value === 'function';
}

/**
 * 判断是否为非null的对象类型
 * @template R - 泛型参数，默认为任意对象类型（需预先定义AnyObject类型）
 * @param value - 需要判断的任意值
 * @returns 类型谓词，返回true时表示value是R类型的对象
 * @example
 * isObj({});         // true
 * isObj(null);       // false
 * isObj([]);         // false
 */
export function isObj<R extends object = AnyObject>(value: any): value is R {
  return value != null && typeof value === 'object';
}

/**
 * 判断是否为字符串类型
 * @template R - 泛型参数，默认为string类型
 * @param value - 需要判断的任意值
 * @returns 类型谓词，返回true时表示value是R类型的字符串
 * @example
 * isStr('hello');    // true
 * isStr(123);        // false
 */
export function isStr<R extends string = string>(value: any): value is R {
  return typeof value === 'string';
}

/**
 * 判断是否为数字类型（不包含NaN）
 * @template R - 泛型参数，默认为number类型
 * @param value - 需要判断的任意值
 * @returns 类型谓词，返回true时表示value是R类型的数字
 * @example
 * isNum(123);        // true
 * isNum('123');      // false
 */
export function isNum<R extends number = number>(value: any): value is R {
  return typeof value === 'number';
}

/**
 * 判断是否为布尔类型
 * @template R - 泛型参数，默认为boolean类型
 * @param value - 需要判断的任意值
 * @returns 类型谓词，返回true时表示value是R类型的布尔值
 * @example
 * isBol(true);       // true
 * isBol(0);          // false
 */
export function isBol<R extends boolean = boolean>(value: any): value is R {
  return typeof value === 'boolean';
}

/**
 * 判断是否为数组类型
 * @template R - 泛型参数，默认为any[]数组类型
 * @param value - 需要判断的任意值
 * @returns 类型谓词，返回true时表示value是R类型的数组
 * @example
 * isArr([1, 2]);     // true
 * isArr({});         // false
 */
export function isArr<R extends any[] = any[]>(value: any): value is R {
  return Array.isArray(value);
}

/**
 * 判断是否为NaN（使用ES6的Number.isNaN规范）
 * @param value - 需要判断的任意值
 * @returns 返回boolean表示是否为NaN
 * @example
 * isNaN(NaN);        // true
 * isNaN('a');        // false（与全局isNaN不同）
 */
export function isNaN(value: any) {
  return Number.isNaN(value);
}
