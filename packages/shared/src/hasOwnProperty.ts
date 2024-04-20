export function hasOwnProperty<Obj extends object, Prop extends PropertyKey>(
  obj: Partial<Obj>,
  prop: Prop,
): obj is Obj & Record<Prop, Prop extends keyof Obj ? Obj[Prop] : any> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
