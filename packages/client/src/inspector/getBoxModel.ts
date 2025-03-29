import { createStyleGetter, checkVisibility } from '../utils/dom';
import { checkValidElement } from '../utils/checkElement';
import { getDOMRect, getCompositeZoom } from '../utils/getDOMRect';
import { IS_FIREFOX } from '../constants';

/**
 * 表示盒子模型单边尺寸数据
 */
export interface BoxLine {
  /** 上边尺寸（像素） */
  top: number;
  /** 右边尺寸（像素） */
  right: number;
  /** 下边尺寸（像素） */
  bottom: number;
  /** 左边尺寸（像素） */
  left: number;
}

/**
 * 表示完整的盒子模型数据
 */
export interface BoxLines {
  /** 外边距数据 */
  margin: BoxLine;
  /** 边框数据 */
  border: BoxLine;
  /** 内边距数据 */
  padding: BoxLine;
}

/**
 * 表示元素位置和尺寸数据
 */
export interface BoxRect extends BoxLine {
  /** 元素总宽度（包含边框和内边距） */
  width: number;
  /** 元素总高度（包含边框和内边距） */
  height: number;
}

// Firefox 不需要处理边框缩放
const IS_BORDER_WITH_ZOOM = !IS_FIREFOX;

/**
 * 获取元素的完整盒子模型数据
 * @param el - 目标HTML元素
 * @returns 包含位置数据和盒子模型数据的元组
 */
export function getBoxModel(el: HTMLElement | null): [BoxRect, BoxLines] {
  if (!checkValidElement(el) || !checkVisibility(el)) {
    return getDefaultBoxModel();
  }

  // 获取元素基础几何数据
  const domeRect = getDOMRect(el);
  const getStyle = createStyleGetterWithZoom(el);

  // 获取各边样式值
  const margin = getMarginValues(getStyle);
  const border = getBorderValues(getStyle);
  const padding = getPaddingValues(getStyle);

  // 计算最终定位数据
  const position = calculatePositionMetrics(domeRect, margin);

  return [
    position,
    {
      margin,
      border,
      padding,
    },
  ];
}

/**
 * 创建带缩放处理的样式获取器
 * @param el - 目标HTML元素
 * @returns 处理缩放后的样式值获取函数
 */
function createStyleGetterWithZoom(el: HTMLElement) {
  const getStyle = createStyleGetter(el);
  const zoom = getCompositeZoom(el);

  return (prop: string, useZoom = true) => {
    const baseValue = Math.max(getStyle(prop), 0);
    return useZoom ? baseValue * zoom : baseValue;
  };
}

/**
 * 获取默认空盒子模型数据
 * @returns 空盒子模型数据元组
 */
export function getDefaultBoxModel(): [BoxRect, BoxLines] {
  return [
    createBoxRect(),
    {
      margin: createBoxLine(),
      border: createBoxLine(),
      padding: createBoxLine(),
    },
  ];
}

// 以下为工具函数组 -----------------------------------

/**
 * 获取四边外边距值
 * @param getStyle - 样式获取函数
 */
function getMarginValues(getStyle: Function): BoxLine {
  return createBoxLine(
    getStyle('margin-top'),
    getStyle('margin-right'),
    getStyle('margin-bottom'),
    getStyle('margin-left'),
  );
}

/**
 * 获取四边边框值（特殊处理Firefox缩放）
 * @param getStyle - 样式获取函数
 */
function getBorderValues(getStyle: Function): BoxLine {
  return createBoxLine(
    getStyle('border-top', IS_BORDER_WITH_ZOOM),
    getStyle('border-right', IS_BORDER_WITH_ZOOM),
    getStyle('border-bottom', IS_BORDER_WITH_ZOOM),
    getStyle('border-left', IS_BORDER_WITH_ZOOM),
  );
}

/**
 * 获取四边内边距值
 * @param getStyle - 样式获取函数
 */
function getPaddingValues(getStyle: Function): BoxLine {
  return createBoxLine(
    getStyle('padding-top'),
    getStyle('padding-right'),
    getStyle('padding-bottom'),
    getStyle('padding-left'),
  );
}

/**
 * 计算元素最终定位指标
 * @param rect - 元素基础矩形数据
 * @param margin - 外边距数据
 */
function calculatePositionMetrics(rect: Omit<DOMRectReadOnly, 'toJSON'>, margin: BoxLine) {
  return createBoxRect(
    rect.width + margin.left + margin.right,
    rect.height + margin.top + margin.bottom,
    rect.top - margin.top,
    rect.right + margin.right,
    rect.bottom + margin.bottom,
    rect.left - margin.left,
  );
}

/**
 * 创建矩形数据对象
 * @param width - 总宽度（默认0）
 * @param height - 总高度（默认0）
 * @param top - 顶部位置（默认0）
 * @param right - 右侧位置（默认0）
 * @param bottom - 底部位置（默认0）
 * @param left - 左侧位置（默认0）
 */
function createBoxRect(width = 0, height = 0, top = 0, right = 0, bottom = 0, left = 0): BoxRect {
  return {
    width,
    height,
    top,
    right,
    bottom,
    left,
  };
}

/**
 * 创建单边尺寸对象
 * @param top - 上边尺寸（默认0）
 * @param right - 右边尺寸（默认0）
 * @param bottom - 下边尺寸（默认0）
 * @param left - 左边尺寸（默认0）
 */
function createBoxLine(top = 0, right = 0, bottom = 0, left = 0): BoxLine {
  return {
    top,
    right,
    bottom,
    left,
  };
}
