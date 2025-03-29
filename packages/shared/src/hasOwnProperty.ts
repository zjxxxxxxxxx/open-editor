const _ = Object.prototype.hasOwnProperty;

/**
 * 类型安全的属性存在性检查函数
 *
 * @template Obj - 待检查的宿主对象类型（需继承普通对象）
 * @template Prop - 要检查的属性键类型（支持 string | number | symbol）
 *
 * @param {Obj} obj - 需要检查的目标对象
 * @param {Prop} prop - 需要检查的属性名称
 *
 * @returns {obj is Obj & Record<Prop, Prop extends keyof Obj ? Obj[Prop] : unknown>}
 *  返回类型谓词，用于类型收窄：
 *  - 当属性存在时，对象类型将包含该属性的确定类型
 *  - 当属性不存在时，保持原对象类型不变
 *
 * @example
 * declare const user: { name?: string };
 * if (hasOwn(user, 'name')) {
 *   user.name.toUpperCase(); // 类型安全访问
 * }
 */
export function hasOwn<Obj extends object, Prop extends PropertyKey>(
  obj: Obj,
  prop: Prop,
): obj is Obj & Record<Prop, Prop extends keyof Obj ? Obj[Prop] : unknown> {
  /**
   * 安全检测逻辑说明：
   * 使用 Object.prototype 的原生方法避免以下情况：
   * 1. 对象可能重写 hasOwnProperty 方法（如 { hasOwnProperty: null }）
   * 2. 对象原型链被修改（如 Object.create(null) 创建的无原型对象）
   * 3. ES6 Symbol 属性的正确检测
   */
  return _.call(obj, prop);
}
