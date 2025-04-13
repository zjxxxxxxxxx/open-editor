import { createStyleGetter, checkVisibility } from '../utils/dom';
import { checkValidElement } from '../utils/checkElement';
import { getDOMRect, getCompositeZoom } from '../utils/getDOMRect';
import { IS_FIREFOX } from '../constants';

/**
 * 表示盒模型的完整数据，包括位置数据和各层级测量数据
 *
 * 当元素不可见或无效时返回的安全数据：
 * - 位置数据：所有方向均为 0
 * - 测量数据：margin / border / padding 均为零尺寸
 */
export type BoxModel = [BoxPosition, BoxMetrics];

/**
 * 表示元素在浏览器视口中的绝对位置
 *
 * 使用视口坐标系相对于视口左上角描述元素四边的精确位置，
 * 此数据已包含外边距的影响，可直接用于碰撞检测等场景。
 *
 * 注：
 * - 宽度和高度不直接存储，而通过 right - left 和 bottom - top 计算，
 *   以确保与盒模型其他数据的一致性。
 */
export interface BoxPosition extends BoxEdges {
  /**
   * 已禁用：请通过 right - left 计算宽度
   * @deprecated 请通过 right - left 计算实际宽度
   */
  width?: undefined;
  /**
   * 已禁用：请通过 bottom - top 计算高度
   * @deprecated 请通过 bottom - top 计算实际高度
   */
  height?: undefined;
}

/**
 * 表示完整的盒模型测量数据
 *
 * 包含影响元素布局的三个层级测量值：
 * - margin: 元素与其他元素之间的缓冲区域
 * - border: 围绕元素内容和内边距的可视化边界
 * - padding: 内容区域与边框之间的内部间距
 *
 * 所有测量值均已考虑浏览器缩放因素。
 */
export interface BoxMetrics {
  margin: BoxEdges;
  border: BoxEdges;
  padding: BoxEdges;
}

/**
 * 表示盒模型单边尺寸数据
 *
 * 描述 CSS 盒模型四个方向的数值测量结果，
 * 所有值均为经过缩放校正后的设备像素值，
 * 可直接用于精确布局计算。
 */
export interface BoxEdges {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// Firefox 下边框尺寸计算已自动包含缩放因子，所以无需额外处理
const IS_BORDER_WITH_ZOOM = !IS_FIREFOX;

// 空盒模型单边尺寸数据，冻结后防止误修改
const EMPTY_BOX_EDGES: BoxEdges = Object.freeze({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

// 空盒模型测量数据，冻结后防止误修改
const EMPTY_BOX_METRICS: BoxMetrics = Object.freeze({
  margin: EMPTY_BOX_EDGES,
  border: EMPTY_BOX_EDGES,
  padding: EMPTY_BOX_EDGES,
});

// 空盒模型数据，确保调用者无需进行空值检查
const EMPTY_BOX_MODEL: BoxModel = [EMPTY_BOX_EDGES, EMPTY_BOX_METRICS];

/**
 * 计算目标 HTML 元素的完整盒模型测量数据。
 *
 * @param element - 目标 HTML 元素节点
 *
 * @returns 元组包含：
 *   [0] BoxRect：元素在文档中的绝对位置（包含外边距）
 *   [1] BoxMetrics：各盒模型层级的详细测量数据
 *
 * 当元素未挂载、不可见或无效时，返回安全数据 EMPTY_BOX_MODEL。
 */
export function computedBoxModel(element: HTMLElement | null) {
  if (!checkValidElement(element) || !checkVisibility(element)) {
    return EMPTY_BOX_MODEL;
  }

  // 获取元素的基础几何数据（包括滚动和 CSS 变换的影响）
  const rect = getDOMRect(element);
  // 创建用于构造各层边距数据的函数
  const buildEdges = createEdgesBuilder(element);

  // 构建各盒模型层级的测量数据
  const margin = buildEdges('margin');
  const border = buildEdges('border', IS_BORDER_WITH_ZOOM);
  const padding = buildEdges('padding');

  // 计算实际位置时，需要考虑外边距
  const computedPosition = {
    top: rect.top - margin.top,
    right: rect.right + margin.right,
    bottom: rect.bottom + margin.bottom,
    left: rect.left - margin.left,
  };

  return [computedPosition, { margin, border, padding }] as BoxModel;
}

/**
 * 构建一个生成四边测量数据的函数。
 *
 * @param element - 目标 HTML 元素
 *
 * @returns 返回一个函数，该函数接受样式属性前缀（如 "margin"、"border"、"padding"）及是否应用缩放（默认为 true）
 *          并生成包含 top, right, bottom, left 四个方向的测量值。
 */
function createEdgesBuilder(element: HTMLElement) {
  const baseStyleGetter = createStyleGetter(element);
  const zoomFactor = getCompositeZoom(element);

  /**
   * 根据属性名称获取经过缩放校正后的数值。
   *
   * @param prop - CSS 属性名称（例如 "margin-top"）
   * @param useZoom - 是否应用缩放校正
   * @returns 经过缩放（如果需要）的属性值
   */
  function getZoomedStyle(prop: string, useZoom: boolean) {
    const baseValue = Math.max(baseStyleGetter(prop), 0);
    return useZoom ? baseValue * zoomFactor : baseValue;
  }

  // 返回一个构造器函数，通过传入样式属性前缀来生成四边数据
  return (prefix: string, useZoom = true) => {
    return {
      top: getZoomedStyle(`${prefix}-top`, useZoom),
      right: getZoomedStyle(`${prefix}-right`, useZoom),
      bottom: getZoomedStyle(`${prefix}-bottom`, useZoom),
      left: getZoomedStyle(`${prefix}-left`, useZoom),
    };
  };
}
