import { createStyleGetter, checkVisibility } from '../utils/dom';
import { checkValidElement } from '../utils/checkElement';
import { getDOMRect, getCompositeZoom } from '../utils/getDOMRect';
import { IS_FIREFOX } from '../constants';

/**
 * 表示盒模型单边尺寸数据
 *
 * @remarks
 * 描述 CSS 盒模型四个方向的数值测量结果，所有值均为经过缩放校正后的
 * 设备像素值，可直接用于精确布局计算
 */
export interface BoxEdges {
  /** 上边尺寸（从元素顶部外边缘到内容区域顶部的距离） */
  top: number;
  /** 右边尺寸（从元素右端外边缘到内容区域右端的距离） */
  right: number;
  /** 下边尺寸（从元素底部外边缘到内容区域底部的距离） */
  bottom: number;
  /** 左边尺寸（从元素左端外边缘到内容区域左端的距离） */
  left: number;
}

/**
 * 表示完整的盒模型测量数据
 *
 * @remarks
 * 包含影响元素布局的三个层级测量值：
 * - margin: 元素与其他元素之间的缓冲区域
 * - border: 围绕元素内容和内边距的可视化边界
 * - padding: 内容区域与边框之间的内部间距
 *
 * 所有测量值均已考虑浏览器缩放因素
 */
export interface BoxMetrics {
  /** 外边距测量值，表示元素与相邻元素的间距 */
  margin: BoxEdges;
  /** 边框测量值，表示元素边框的物理尺寸 */
  border: BoxEdges;
  /** 内边距测量值，表示内容区域与边框的间距 */
  padding: BoxEdges;
}

/**
 * 表示元素在浏览器视口中的绝对位置和总体尺寸
 *
 * @remarks
 * 使用视口坐标系相对于视口左上角描述元素四边的精确位置，
 * 该数据已包含外边距的影响，可直接用于碰撞检测等场景。
 *
 * 设计决策说明：
 * 1. 未直接实现 width/height 属性的原因：
 *    - 四边坐标差值 right-left/bottom-top 能自动适配以下情况：
 *      * 不同 box-sizing 模式 content-box/border-box
 *      * 父级元素的定位上下文 positioning/context
 *      * CSS 变换 transform 引起的尺寸扭曲
 *    - 防止数据冗余：width/height 可能引起与四边坐标的数值矛盾
 *
 * 2. 坐标计算规则：
 *    - 总宽度 = right - left
 *    - 总高度 = bottom - top
 *    - 该差值包含元素外边距 margin 的物理空间占位
 *
 * 3. 类型安全设计：
 *    - 显式禁用 width/height 属性设为 undefined 防止误用
 *    - 强制使用者通过坐标差值获取尺寸，确保计算结果与定位数据一致
 */
export interface BoxRect extends BoxEdges {
  /**
   * 未实现宽度属性，请使用 right - left 计算
   * @deprecated 该属性已禁用，请通过坐标差值获取实际宽度
   */
  width?: undefined;
  /**
   * 未实现高度属性，请使用 bottom - top 计算
   * @deprecated 该属性已禁用，请通过坐标差值获取实际高度
   */
  height?: undefined;
}

/**
 * 空盒模型数据
 *
 * @remarks
 * 当元素不可见或无效时返回的安全数据，包含：
 * - [0] 位置数据：所有方向设为 0 值
 * - [1] 测量数据：margin/border/padding 均设为空尺寸
 */
export type BoxModel = [BoxRect, BoxMetrics];

// Firefox 的边框尺寸计算已自动包含缩放因子，无需额外处理（参见 https://bugzilla.mozilla.org/show_bug.cgi?id=137054）
const IS_BORDER_WITH_ZOOM = !IS_FIREFOX;

/**
 * 零值尺寸访问器对象
 *
 * @remarks
 * 通过只读 getter 实现的安全访问对象，特性：
 * - 防止意外修改测量数据
 * - 在元素不可见时保持数据一致性
 * - 避免布局计算中的 NaN 污染
 */
const EMPTY_BOX_EDGES = {
  get top() {
    return 0;
  },
  set top(v: number) {
    /* 锁定写入防止数据污染 */
  },
  get right() {
    return 0;
  },
  set right(v: number) {
    /* 锁定写入防止数据污染 */
  },
  get bottom() {
    return 0;
  },
  set bottom(v: number) {
    /* 锁定写入防止数据污染 */
  },
  get left() {
    return 0;
  },
  set left(v: number) {
    /* 锁定写入防止数据污染 */
  },
};

/**
 * 空盒模型数据默认值
 *
 * @remarks
 * 当元素不可见或无效时返回的安全数据，包含：
 * - [0] 位置数据：所有方向设为 0 值
 * - [1] 测量数据：margin/border/padding 均设为空尺寸
 *
 * 该设计确保调用方无需空值检查即可安全访问属性
 */
const EMPTY_BOX_MODEL = [
  EMPTY_BOX_EDGES,
  {
    margin: EMPTY_BOX_EDGES,
    border: EMPTY_BOX_EDGES,
    padding: EMPTY_BOX_EDGES,
  },
] as BoxModel;

/**
 * 获取元素完整的盒模型测量数据
 *
 * @param el - 目标 HTML 元素节点
 *
 * @returns 元组包含：
 * - [0] BoxRect: 元素在文档中的绝对位置（含外边距影响）
 * - [1] BoxMetrics: 盒模型各层级的详细测量值
 *
 * @throws 隐式错误
 * 当元素满足以下条件时返回空数据：
 * - 未挂载到 DOM 树
 * - 设置 display: none
 * - visibility: hidden 不会影响测量结果
 *
 * @example
 * ```typescript
 * // 获取按钮元素的盒模型数据
 * const button = document.getElementById('submit-btn');
 * const [position, metrics] = getBoxModel(button);
 *
 * // 计算元素总宽度（内容 + 内边距 + 边框 + 外边距）
 * const totalWidth = position.right - position.left
 *   + metrics.margin.left + metrics.margin.right;
 * ```
 */
export function getBoxModel(el: HTMLElement | null): BoxModel {
  // 验证元素有效性：已挂载且可见
  if (!checkValidElement(el) || !checkVisibility(el)) {
    return EMPTY_BOX_MODEL;
  }

  // 获取元素基础几何数据，已包含滚动和变换影响
  const rect = getDOMRect(el);

  // 创建带缩放校正的样式值获取器
  const getStyle = createStyleGetterWithZoom(el);

  // 生成各层测量数，处理浏览器兼容性差异
  const margin = createBoxEdges('margin');
  const border = createBoxEdges('border', IS_BORDER_WITH_ZOOM);
  const padding = createBoxEdges('padding');

  /**
   * 生成四边测量数据
   *
   * @param name - 样式属性前缀 margin/border/padding
   * @param useZoom - 是否应用缩放校正
   */
  function createBoxEdges(name: string, useZoom?: boolean) {
    return {
      top: getStyle(`${name}-top`, useZoom),
      right: getStyle(`${name}-right`, useZoom),
      bottom: getStyle(`${name}-bottom`, useZoom),
      left: getStyle(`${name}-left`, useZoom),
    };
  }

  return [
    // 计算元素绝对位置，考虑外边距影响
    {
      top: rect.top - margin.top,
      right: rect.right + margin.right,
      bottom: rect.bottom + margin.bottom,
      left: rect.left - margin.left,
    },
    // 返回完整的盒模型测量数据
    { margin, border, padding },
  ];
}

/**
 * 创建支持缩放校正的样式值获取器
 *
 * @param el - 目标 HTML 元素
 *
 * @returns 函数参数：
 * - prop: CSS 属性名，如 'margin-top'
 * - useZoom: 是否应用缩放校正，默认：true
 *
 * @remarks
 * 缩放校正流程：
 * 1. 通过 getComputedStyle 获取原始 CSS 值
 * 2. 解析为浮点数并确保非负
 * 3. 乘以累积缩放因子得到设备像素值
 *
 * 缩放因子通过遍历元素祖先链计算得出，包含：
 * - CSS transform scale()
 * - viewport meta 标签缩放
 * - 浏览器页面缩放
 */
function createStyleGetterWithZoom(el: HTMLElement) {
  // 获取原始样式值访问器
  const getStyle = createStyleGetter(el);

  // 计算元素累积缩放因子，考虑所有祖先元素的变换
  const zoom = getCompositeZoom(el);

  return (prop: string, useZoom = true) => {
    // 获取原始样式值并确保非负
    const baseValue = Math.max(getStyle(prop), 0);

    // 应用缩放校正，Firefox 的 border 属性除外
    return useZoom ? baseValue * zoom : baseValue;
  };
}
