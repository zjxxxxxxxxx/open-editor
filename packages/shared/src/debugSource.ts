/**
 * 表示源码中一个位置的调试信息
 * 包含文件名（或相对/绝对路径）、行号、列号三要素
 */
export interface DSValue {
  /**
   * 源文件路径或模块标识
   */
  file: string;
  /**
   * 行号，从 1 开始计数
   */
  line: number;
  /**
   * 列号，从 1 开始计数
   */
  column: number;
}

/**
 * 用于 JS/TS 属性注入时的字符串模板类型，"file:line:column"
 */
export type DSString = `${string}:${number}:${number}`;

/**
 * 调试信息工具类
 *
 * 提供在运行时注入到组件/DOM 上的标识符和相关常量
 */
export class DS {
  /**
   * 注入到元素/组件 props/attrs 的调试字段名
   */
  static readonly INJECT_PROP = '_debugSource';

  /**
   * 对应 SHADOW_PROP 的 Symbol 键，
   * 用于在不破坏原有 props 对象的情况下访问真实调试信息
   */
  static readonly ID = Symbol.for(DS.INJECT_PROP);

  /**
   * 隐藏属性的 Symbol 键，
   * 将调试信息存放于此，避免与用户属性冲突
   */
  static readonly SHADOW_PROP = `Symbol.for('${DS.INJECT_PROP}')`;

  /**
   * 用于在 React Fiber 节点上挂载调试信息的键前缀（React17 版本）
   */
  static readonly REACT_17 = '__reactFiber$';

  /**
   * 用于在 React InternalInstance 节点上挂载调试信息的键前缀（React15 版本）
   */
  static readonly REACT_15 = '__reactInternalInstance$';

  /**
   * Vue 3 渲染节点上挂载的属性名
   */
  static readonly VUE_V3 = '__vue_v3';

  /**
   * Vue 2 渲染节点上挂载的属性名
   */
  static readonly VUE_V2 = '__vue_v2';
}
