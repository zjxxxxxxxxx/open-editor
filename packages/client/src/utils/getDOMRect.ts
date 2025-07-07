import { jsx } from '../../jsx/jsx-runtime';
import { IS_CLIENT } from '../constants';
import { appendChild, createStyleGetter, CssUtils } from './dom';

// https://drafts.csswg.org/cssom-view/#dom-element-currentcsszoom
const SUPPORT_CURRENT_CSS_ZOOM = IS_CLIENT && 'currentCSSZoom' in document.documentElement;
const SUPPORT_CSS_ZOOM = IS_CLIENT && 'zoom' in document.documentElement.style;

// 缓存检测结果，避免重复计算
let NEED_COMPUTED: boolean;

/**
 * 获取经过 zoom 缩放校正后的元素边界矩形
 *
 * @param target - 目标 HTML 元素
 * @returns 校正后的 DOMRect 对象（当浏览器不自动补偿 zoom 时返回计算后值）
 */
export function getDOMRect(target: HTMLElement) {
  // 获取原始边界矩形
  const rect = target.getBoundingClientRect();

  // 懒检测浏览器是否需要手动补偿
  NEED_COMPUTED ??= checkComputedNeeded();

  // 根据检测结果决定是否补偿
  return NEED_COMPUTED ? computedDOMRect(target, rect) : rect;
}

/**
 * 获取元素及其祖先链的复合 zoom 值
 *
 * @param target - 起始元素
 * @returns 累积的缩放比例（例如祖先链有 zoom:1.2 和 zoom:1.5 则返回 1.8）
 */
export function getCurrentCSSZoom(target: HTMLElement) {
  // 支持 currentCSSZoom 直接返回结果
  if (SUPPORT_CURRENT_CSS_ZOOM) return target.currentCSSZoom;
  // 不支持 zoom 直接返回 1
  if (!SUPPORT_CSS_ZOOM) return 1;

  let currentCSSZoom = 1;
  let currentElement: HTMLElement | null = target;
  // 向上遍历祖先元素
  while (currentElement) {
    // 空值时视为 1 倍缩放
    const zoomValue = createStyleGetter(currentElement)('zoom') || 1;
    currentCSSZoom *= zoomValue;
    currentElement = currentElement.parentElement;
  }
  return currentCSSZoom;
}

/**
 * 动态检测浏览器是否需要手动补偿 zoom 缩放
 * @returns 需要补偿时返回 true
 */
function checkComputedNeeded() {
  // 检测元素基准尺寸
  const DETECT_SIZE = 100;
  // 创建隐藏检测元素（fixed 布局避免影响文档流）
  const detectEl = jsx('div', {
    style: {
      position: 'fixed',
      // 移出可视区域
      top: '-999px',
      // 转换为 '100px'
      width: CssUtils.numberToPx(DETECT_SIZE),
      height: CssUtils.numberToPx(DETECT_SIZE),
      // 设置 2 倍缩放
      zoom: '2',
    },
  });
  appendChild(document.body, detectEl);

  try {
    // 获取实际渲染尺寸
    const { width, height } = detectEl.getBoundingClientRect();
    // 若宽高未按预期变为 200px，说明浏览器未自动补偿，需手动处理
    return width === DETECT_SIZE || height === DETECT_SIZE;
  } finally {
    // 安全移除检测元素（即使发生异常）
    detectEl.remove();
  }
}

/**
 * 计算经过 zoom 缩放后的精确矩形（几何中心变换法）
 *
 * @param target - 需要计算缩放的目标元素（用于遍历父元素链获取累积缩放率）
 * @param baseRect - 目标元素的原始矩形数据（未经缩放补偿的 DOMRect）
 * @returns 校正后的 DOMRect，其位置和尺寸已精确反映 zoom 缩放效果
 */
function computedDOMRect(target: HTMLElement, baseRect: DOMRect) {
  // 获取元素及其所有祖先元素的累积缩放比例
  // 例如：父元素 zoom:1.5，当前元素 zoom:2 → 实际缩放 3 倍
  const zoomRate = getCurrentCSSZoom(target);

  // 无缩放时直接返回原矩形避免计算误差
  if (zoomRate !== 1) {
    // 解构原始矩形参数（未缩放时的值）
    const { x, y, width, height } = baseRect;

    // 计算原始矩形的几何中心坐标 (符合浏览器文档流)
    //
    //  (x, y) █───────────────► X (centerX 向右增加)
    //         █               █
    //         █       ●       █  <-- 几何中心 (centerX, centerY)
    //         █               █
    //         █───────────────
    //         ▼ Y (centerY 向下增加)
    //
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // 计算缩放后的尺寸（直接线性缩放）
    const scaledWidth = width * zoomRate;
    const scaledHeight = height * zoomRate;

    // 关键计算：基于中心点的坐标变换
    // 1. 将中心点坐标按 zoom 缩放 → centerX * zoomRate
    // 2. 用缩放后的尺寸计算左上角位置 → 减去缩放后宽度的一半
    // 等效于：平移中心点到缩放后位置，再计算左上角
    const scaledX = centerX * zoomRate - scaledWidth / 2;
    const scaledY = centerY * zoomRate - scaledHeight / 2;

    // 构造新矩形
    return new DOMRect(scaledX, scaledY, scaledWidth, scaledHeight);
  }

  // 无缩放时直接返回原矩形保持数据一致
  return baseRect;
}
