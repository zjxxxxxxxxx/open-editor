const _ = Object.prototype.hasOwnProperty;

/**
 * 类型安全的属性存在性检查函数
 *
 * @param obj - 需要检查的目标对象
 * @param prop - 需要检查的属性名称
 */
export function hasOwn<Obj extends object, Prop extends PropertyKey>(
  obj: Obj,
  prop: Prop,
): obj is Obj & Record<Prop, Prop extends keyof Obj ? Obj[Prop] : unknown> {
  return _.call(obj, prop);
}

/**
 * 深度比较两个对象是否完全相等
 *
 * 该函数会递归地比较两个对象及其嵌套对象的所有可枚举属性的值
 * 它还会进行一些优化，例如首先检查引用和构造函数是否相同
 *
 * - 对于包含循环引用的对象，此函数可能会导致栈溢出
 * - 数组会被视为对象进行比较，比较的是它们的属性（索引）和值，而不是像专门的数组比较那样只关注元素和顺序
 * - 只比较对象自身的可枚举属性，不会比较原型链上的属性、不可枚举属性或 Symbol 属性
 *
 * @param obj1 第一个要比较的对象可以是任何对象、null 或 undefined
 * @param obj2 第二个要比较的对象可以是任何对象、null 或 undefined
 * @returns 如果两个对象完全相等（包括嵌套对象的所有可枚举属性值），则返回 true；否则返回 false
 */
export function isObjectsEqual<T extends AnyObject>(
  obj1: T | null | undefined,
  obj2: T | null | undefined,
): boolean {
  // 如果两个对象引用同一个内存地址，它们肯定是相等的
  if (obj1 === obj2) {
    return true;
  }

  // 如果只有一个对象是 null 或 undefined，它们肯定不相等
  if (obj1 == null || obj2 == null) {
    return false;
  }

  // 如果两个对象的构造函数不同，它们通常不认为是完全相同的
  if (obj1.constructor !== obj2.constructor) {
    return false;
  }

  // 获取两个对象自身可枚举属性的名称数组如果属性数量不同，它们肯定不相等
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  // 为了更快的查找，将 keys2 的属性名放入一个 Set 中
  const keys2Set = new Set(keys2);

  //  递归地遍历第一个对象的属性并比较值
  for (const key of keys1) {
    // 检查第一个对象的属性是否存在于第二个对象中
    if (!keys2Set.has(key)) {
      return false;
    }

    const value1 = obj1[key];
    const value2 = obj2[key];

    // 如果两个属性的值都是对象且不为 null，则递归调用 isObjectsEqual 进行比较
    if (
      typeof value1 === 'object' &&
      value1 !== null &&
      typeof value2 === 'object' &&
      value2 !== null
    ) {
      if (!isObjectsEqual(value1, value2)) {
        return false;
      }
    } else if (value1 !== value2) {
      // 如果属性值不是对象，则直接使用严格相等运算符进行比较
      return false;
    }
  }

  // 如果所有检查都通过，则两个对象完全相等
  return true;
}
