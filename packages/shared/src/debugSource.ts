/**
 * 表示调试信息中源代码位置的值对象。
 */
export interface DSValue {
  /**
   * 文件路径或名称。
   */
  file: string;
  /**
   * 行号（从 1 开始）。
   */
  line: number;
  /**
   * 列号（从 1 开始）。
   */
  column: number;
}

/**
 * 字符串形式的调试源信息，格式：`${file}:${line}:${column}`。
 * - file：文件路径或名称
 * - line：行号（从 1 开始）
 * - column：列号（从 1 开始）
 */
export type DSString = `${string}:${number}:${number}`;

export class DS {
  static readonly INJECT_PROP = '_debugSource';
  static readonly SHADOW_PROP = `Symbol.for('${DS.INJECT_PROP}')`;
  static readonly ID = Symbol.for(DS.INJECT_PROP);
  static readonly REACT_17 = '__reactFiber$';
  static readonly REACT_15 = '__reactInternalInstance$';
  static readonly VUE_3 = '__vnode';
  static readonly VUE_2 = '__vnode_v2';
}
