import { IS_CLIENT } from '../constants';
import { appendChild, applyStyle, createStyleGetter, CssUtils } from './dom';

// 判断是否支持zoom属性
const SUPPORT_ZOOM = IS_CLIENT && 'zoom' in document.documentElement.style;

// 缓存检测结果，避免重复计算
let NEED_COMPUTED: boolean;

/**
 * 获取经过zoom缩放校正后的元素边界矩形
 * @param target - 目标HTML元素
 * @returns 校正后的DOMRect对象（当浏览器不自动补偿zoom时返回计算后值）
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
 * 获取元素及其祖先链的复合zoom值
 * @param target - 起始元素
 * @returns 累积的缩放比例（例如祖先链有zoom:1.2和zoom:1.5则返回1.8）
 */
export function getCompositeZoom(target: HTMLElement) {
  let zoom = 1;

  // 不支持zoom直接返回1
  if (!SUPPORT_ZOOM) return zoom;

  let currentElement: HTMLElement | null = target;

  // 向上遍历祖先元素
  while (currentElement) {
    const zoomValue = createStyleGetter(currentElement)('zoom');
    zoom *= zoomValue || 1; // 空值时视为1倍缩放

    // 安全遍历父元素
    currentElement = currentElement.parentElement;

    // 终止条件：到达HTML根元素或超出安全深度
    if (currentElement?.tagName === 'HTML') break;
  }

  return zoom;
}

/**
 * 动态检测浏览器是否需要手动补偿zoom缩放
 * @returns 需要补偿时返回true
 */
function checkComputedNeeded() {
  // 检测元素基准尺寸
  const DETECT_SIZE = 100;
  // 创建隐藏检测元素（fixed布局避免影响文档流）
  const detectEl = document.createElement('div');
  applyStyle(detectEl, {
    position: 'fixed',
    top: '-9999px', // 移出可视区域
    width: CssUtils.numberToPx(DETECT_SIZE), // 转换为'100px'
    height: CssUtils.numberToPx(DETECT_SIZE),
    // @ts-ignore
    zoom: '2', // 设置2倍缩放
  });
  appendChild(document.body, detectEl);

  try {
    // 获取实际渲染尺寸
    const { width, height } = detectEl.getBoundingClientRect();
    // 若宽高未按预期变为200px，说明浏览器未自动补偿，需手动处理
    return width === DETECT_SIZE || height === DETECT_SIZE;
  } finally {
    // 安全移除检测元素（即使发生异常）
    detectEl.remove();
  }
}

/**
 * 计算经过zoom缩放后的精确矩形（几何中心变换法）
 *
 * 核心原理：以元素几何中心为基准进行缩放，避免传统左上角缩放导致的偏移问题
 *
 * @param target - 需要计算缩放的目标元素
 *                （用于遍历父元素链获取累积缩放率）
 * @param baseRect - 目标元素的原始矩形数据（未经缩放补偿的DOMRect）
 * @returns 校正后的DOMRect，其位置和尺寸已精确反映zoom缩放效果
 *
 * @注意事项
 * 此方法专门处理CSS的zoom属性缩放，与transform:scale的坐标系不同
 */
function computedDOMRect(target: HTMLElement, baseRect: DOMRect) {
  // 获取元素及其所有祖先元素的累积缩放比例
  // 例如：父元素zoom:1.5，当前元素zoom:2 → 实际缩放3倍
  const zoomRate = getCompositeZoom(target);

  // 优化：无缩放时直接返回原矩形避免计算误差
  if (zoomRate !== 1) {
    // 解构原始矩形参数（未缩放时的值）
    const { x, y, width, height } = baseRect;

    // 计算原始矩形的几何中心坐标
    // ██████████████
    // █    ▶ centerX
    // █元素原始位置
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // 计算缩放后的尺寸（直接线性缩放）
    const scaledWidth = width * zoomRate;
    const scaledHeight = height * zoomRate;

    // 关键计算：基于中心点的坐标变换
    // 1. 将中心点坐标按zoom缩放 → centerX * zoomRate
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
