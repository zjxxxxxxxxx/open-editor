/**
 * 元素检测模块状态管理接口
 * 用于跟踪和管理页面元素检测工具的各种状态
 */
export interface InspectorState {
  /**
   * 是否启用元素检测功能
   * @default false
   */
  isEnable: boolean;

  /**
   * 检测工具当前是否处于激活状态
   * @default false
   */
  isActive: boolean;

  /**
   * 是否正在执行元素渲染操作
   * @default false
   */
  isRendering: boolean;

  /**
   * 元素结构树面板是否展开
   * @default false
   */
  isTreeOpen: boolean;

  /**
   * 当前激活的页面元素引用
   * @default null
   */
  activeEl: HTMLElement | null;

  /**
   * 上一个被激活的页面元素引用
   * 用于状态回退或对比操作
   * @default null
   */
  prevActiveEl: HTMLElement | null;
}

/**
 * 元素检测模块状态实例
 * 包含检测功能的全量状态参数，各属性初始值应与接口默认值声明保持一致
 */
export const inspectorState: InspectorState = {
  isEnable: false,
  isActive: false,
  isRendering: false,
  isTreeOpen: false,
  activeEl: null,
  prevActiveEl: null,
};
