import { isObjectsEqual } from '@open-editor/shared/object';
import { addClass, removeClass } from '../utils/dom';
import {
  type BoxModel,
  type BoxPosition,
  type BoxMetrics,
  type BoxEdges,
} from '../inspector/computedBoxModel';
import { inspectorEnableBridge, inspectorExitBridge, boxModelBridge } from '../bridge';
import { type WebGLRenderer, createWebGLRenderer } from './WebGLRenderer';

/**
 * Chromium DevTools 盒模型高亮配色方案（RGBA 预乘透明度通道）
 */
const BOX_EDGES_COLORS = {
  margin: new Float32Array([0.636, 0.46, 0.277, 0.66]),
  border: new Float32Array([0.66, 0.592, 0.394, 0.66]),
  padding: new Float32Array([0.295, 0.424, 0.27, 0.55]),
  content: new Float32Array([0.287, 0.435, 0.57, 0.66]),
};

/**
 * 创建覆盖层 Canvas，并初始化 WebGL 渲染器、尺寸监听和事件桥接
 *
 * 使用 WebGL 绘制可以比 Canvas 2D 更高效地处理复杂图形与频繁更新场景
 * @returns 初始化完成的 canvas 元素
 */
export function OverlayUI() {
  // 创建带有覆盖层样式的 Canvas 元素
  const canvas = (<canvas className="oe-overlay" />) as HTMLCanvasElement;

  // 初始化 WebGL 渲染器，预留 512 个 float 的固定容量缓冲区（盒模型渲染所需为 468 个，余 44 个空闲）
  const renderer = createWebGLRenderer(canvas, 512);

  // 使用 ResizeObserver 监听尺寸变化，并及时更新渲染器视口
  new ResizeObserver(() => renderer.updateViewport()).observe(canvas);

  // 建立与外部事件系统的交互桥接
  setupBridgeSystem(canvas, renderer);

  return canvas;
}

/**
 * 建立外部事件与渲染逻辑的桥接系统
 *
 * @param canvas - 目标 canvas 元素
 * @param renderer - WebGLRenderer 实例
 */
function setupBridgeSystem(canvas: HTMLCanvasElement, renderer: WebGLRenderer) {
  const OVERLAY_SHOW_CLASS = 'oe-overlay-show';
  // 保存最后一次的盒模型数据，用于对比是否需要重新渲染
  let lastBoxModel: BoxModel | null = null;

  // 当检查器启用时，添加显示类名并更新视口
  inspectorEnableBridge.on(() => {
    addClass(canvas, OVERLAY_SHOW_CLASS);
    renderer.updateViewport();
  });

  // 当退出检查器时，清理画布并重置盒模型数据
  inspectorExitBridge.on(() => {
    removeClass(canvas, OVERLAY_SHOW_CLASS);
    renderer.clear(true);
    lastBoxModel = null;
  });

  // 当盒模型数据更新时，检测数据是否有变更，若有则更新渲染
  boxModelBridge.on((position: BoxPosition, metrics: BoxMetrics) => {
    if (hasBoxModelChanged(position, metrics)) {
      updateBoxModel(renderer, position, metrics);
    }
  });

  /**
   * 判断盒模型数据是否发生了变化
   *
   * @param position - 目标元素的边界位置信息
   * @param metrics - 盒模型各区域的边缘宽度数据
   * @returns 若数据没有变更则返回 false，否则更新 lastBoxModel 并返回 true
   */
  function hasBoxModelChanged(position: BoxPosition, metrics: BoxMetrics) {
    const [lastPosition, lastMetrics] = lastBoxModel ?? [];
    if (isObjectsEqual(position, lastPosition) && isObjectsEqual(metrics, lastMetrics)) {
      return false;
    }
    lastBoxModel = [position, metrics];
    return true;
  }
}

/**
 * 处理盒模型数据更新并渲染
 *
 * @param renderer - WebGLRenderer 实例
 * @param position - 目标元素的边界位置信息
 * @param metrics - 盒模型各区域的边缘宽度数据
 */
function updateBoxModel(renderer: WebGLRenderer, position: BoxPosition, metrics: BoxMetrics) {
  renderer.clear();
  // 重用顶点数组，减少垃圾回收开销
  const vertices: number[] = [];
  // 浅拷贝初始边界，后续根据各区域数据向内收缩
  const bounds = { ...position };
  // 缓存设备像素比
  const pr = renderer.pixelRatio;

  // 遍历 margin、border、padding 区域（对象 key 与 BOX_EDGES_COLORS 中的 key 保持一致）
  for (const [key, edges] of Object.entries(metrics)) {
    processEdges(vertices, bounds, edges, pr, BOX_EDGES_COLORS[key]);
    updateBounds(bounds, edges);
  }

  // 绘制 content 区域（剩余区域）
  rectangleVertices(
    vertices,
    bounds.left,
    bounds.top,
    bounds.right - bounds.left,
    bounds.bottom - bounds.top,
    BOX_EDGES_COLORS.content,
    pr,
  );

  // 提交所有顶点数据进行绘制
  renderer.draw(vertices);
}

/**
 * 处理单个边缘的顶点数据生成
 *
 * 按顺时针顺序处理四条边：上 → 右 → 下 → 左，
 * 每条边使用 rectangleVertices 生成顶点数据，并避免重叠绘制
 *
 *       +-----------------+----+
 *       |                 |    |
 *       +----+------------+    |
 *       |    |            |    |
 *       |    |            |    |
 *       |    +------------+----+
 *       |    |                 |
 *       +----+-----------------+
 *
 * @param vertices - 顶点数据数组
 * @param bounds - 当前矩形边界，会根据当前区域数据收缩
 * @param edges - 当前区域对应的边缘宽度数据
 * @param pixelRatio - 设备像素比
 * @param color - 当前区域的预乘颜色值
 */
function processEdges(
  vertices: number[],
  bounds: BoxPosition,
  edges: BoxEdges,
  pixelRatio: number,
  color: Float32Array,
) {
  // 上边缘：保留右侧边缘宽度
  if (edges.top) {
    rectangleVertices(
      vertices,
      bounds.left,
      bounds.top,
      bounds.right - bounds.left - edges.right,
      edges.top,
      color,
      pixelRatio,
    );
  }
  // 右边缘：保留下边缘宽度
  if (edges.right) {
    rectangleVertices(
      vertices,
      bounds.right - edges.right,
      bounds.top,
      edges.right,
      bounds.bottom - bounds.top - edges.top,
      color,
      pixelRatio,
    );
  }
  // 下边缘：保留左侧边缘宽度
  if (edges.bottom) {
    rectangleVertices(
      vertices,
      bounds.left + edges.left,
      bounds.bottom - edges.bottom,
      bounds.right - bounds.left - edges.left,
      edges.bottom,
      color,
      pixelRatio,
    );
  }
  // 左边缘：保留上边缘宽度
  if (edges.left) {
    rectangleVertices(
      vertices,
      bounds.left,
      bounds.top + edges.top,
      edges.left,
      bounds.bottom - bounds.top - edges.top,
      color,
      pixelRatio,
    );
  }
}

/**
 * 生成矩形的顶点数据
 *
 * 将矩形拆分为两个三角形（每个三角形包含三个顶点），
 * 每个顶点数据由物理像素坐标（CSS 像素乘以 pixelRatio）和颜色信息组成
 *
 * 顶点顺序定义 (用于正面渲染，并符合浏览器文档流坐标):
 * 三角形 1: 左上, 右上, 左下
 * 三角形 2: 右上, 右下, 左下
 *
 * @param vertices - 用于保存生成顶点数据的数组
 * @param x - 矩形左上角 X 坐标（CSS 像素）
 * @param y - 矩形左上角 Y 坐标（CSS 像素）
 * @param width - 矩形宽度（CSS 像素）
 * @param height - 矩形高度（CSS 像素）
 * @param color - 预乘颜色值 [r, g, b, a]
 * @param pixelRatio - 设备像素比
 */
function rectangleVertices(
  vertices: number[],
  x: number,
  y: number,
  width: number,
  height: number,
  color: Float32Array,
  pixelRatio: number,
) {
  // 如果宽度或高度无效则直接返回
  if (width <= 0 || height <= 0) return;

  const pr = pixelRatio;
  const x1 = x * pr; // 左侧 X
  const y1 = y * pr; // 顶部 Y
  const x2 = (x + width) * pr; // 右侧 X
  const y2 = (y + height) * pr; // 底部 Y

  // 三角形 1 (左上, 右上, 左下)
  vertices.push(x1, y1, ...color, x2, y1, ...color, x1, y2, ...color);
  // 三角形 2 (右上, 右下, 左下)
  vertices.push(x2, y1, ...color, x2, y2, ...color, x1, y2, ...color);
}

/**
 * 更新当前矩形边界（向内部收缩）
 *
 * 根据当前区域边缘宽度调整矩形边界，确保后续区域的绘制在剩余空间内进行，
 * 并防止边界交叉（例如 top 超过 bottom）
 *
 * @param bounds - 当前矩形边界对象，原地修改
 * @param edges - 当前区域的边缘宽度数据
 */
function updateBounds(bounds: BoxPosition, edges: BoxEdges) {
  bounds.top = Math.min(bounds.top + edges.top, bounds.bottom);
  bounds.right = Math.max(bounds.right - edges.right, bounds.left);
  bounds.bottom = Math.max(bounds.bottom - edges.bottom, bounds.top);
  bounds.left = Math.min(bounds.left + edges.left, bounds.right);
}
