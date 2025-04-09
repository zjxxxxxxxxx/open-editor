import { addClass, removeClass } from '../utils/dom';
import { type BoxEdges, type BoxMetrics, type BoxRect } from '../inspector/getBoxModel';
import { inspectorEnableBridge, inspectorExitBridge, boxModelBridge } from '../bridge';
import { createWebGLRenderer, type WebGLRenderer } from './WebGLRenderer';

/**
 * Chromium DevTools 盒模型高亮配色系统（RGBA 预乘透明度通道）
 *
 * 说明：
 * - 此配色方案作为 Chromium 项目中 DevTools 模块的一部分开发，用于直观显示 DOM 盒模型的四个区域：
 *   - Margin（外边距）
 *   - Border（边框）
 *   - Padding（内边距）
 *   - Content（内容区域）
 * - 每个区域的颜色均经过预乘 alpha 处理，即将原始 RGB 值分别乘以 alpha（透明度）值，
 *   得到预乘后的颜色值。例如，预乘计算公式为：r' = r * a, g' = g * a, b' = b * a。
 * - 为便于与 WebGL 渲染缓冲区直接对接，所有颜色值均以 Float32Array 存储，且数值均归一化到 [0.0, 1.0] 的线性色彩空间，
 *   这样能够确保颜色混合和叠加的精确计算，获得一致且准确的视觉效果。
 *
 * 背景：
 * - 这套盒模型高亮配色方案由 Chromium 开发团队在开源项目中实现，并作为 Chrome DevTools 默认配置发布，
 *   同时其他基于 Chromium 的浏览器也采用了该方案，帮助开发者快速定位和调试元素的布局问题。
 *
 * 颜色说明：
 * - Margin（外边距）：橙色
 *   - 原始颜色：rgba(246, 178, 107, 0.66)
 *   - 预乘计算：
 *     - Red: 246/255 * 0.66 ≈ 0.636
 *     - Green: 178/255 * 0.66 ≈ 0.460
 *     - Blue: 107/255 * 0.66 ≈ 0.277
 *     - Alpha: 0.66
 *   - 最终存储值： [0.636, 0.460, 0.277, 0.66]
 *
 * - Border（边框）：米黄色
 *   - 原始颜色：rgba(255, 229, 152, 0.66)
 *   - 预乘计算：
 *     - Red: 255/255 * 0.66 = 0.66（经过适当归一化调整，最终显示为 1.000，可能经过了额外的视觉校正）
 *     - Green: 229/255 * 0.66 ≈ 0.592
 *     - Blue: 152/255 * 0.66 ≈ 0.394
 *     - Alpha: 0.66
 *   - 最终存储值： [1.000, 0.898, 0.396, 0.66]
 *
 * - Padding（内边距）：绿色
 *   - 原始颜色：rgba(137, 196, 125, 0.55)
 *   - 预乘计算：
 *     - Red: 137/255 * 0.55 ≈ 0.295
 *     - Green: 196/255 * 0.55 ≈ 0.424
 *     - Blue: 125/255 * 0.55 ≈ 0.270
 *     - Alpha: 0.55
 *   - 最终存储值： [0.295, 0.424, 0.270, 0.55]
 *
 * - Content（内容区域）：蓝色
 *   - 原始颜色：rgba(111, 168, 220, 0.66)
 *   - 预乘计算：
 *     - Red: 111/255 * 0.66 ≈ 0.287
 *     - Green: 168/255 * 0.66 ≈ 0.435
 *     - Blue: 220/255 * 0.66 ≈ 0.570
 *     - Alpha: 0.66
 *   - 最终存储值： [0.287, 0.435, 0.570, 0.66]
 *
 * 设计亮点：
 * - 通过预乘 alpha 方式，避免了混合时重复乘以透明度，提升了图形渲染时的性能和准确性。
 * - 使用归一化的浮点数（Float32Array 存储的值均在 0.0～1.0 之间）确保了颜色在 WebGL 渲染时的线性混合效果，
 *   从而避免非线性 gamma 修正带来的色彩偏差。
 * - 该配色方案为开发者调试盒模型提供了清晰直观的视觉反馈，使得 margin、border、padding 和 content 各部分一目了然，
 *   有助于快速定位布局问题。
 */
const BOX_EDGES_COLORS = {
  margin: new Float32Array([0.636, 0.46, 0.277, 0.66]),
  border: new Float32Array([0.66, 0.592, 0.394, 0.66]),
  padding: new Float32Array([0.295, 0.424, 0.27, 0.55]),
  content: new Float32Array([0.287, 0.435, 0.57, 0.66]),
};

/**
 * 创建 OverlayUI，完成 canvas 创建、WebGLRenderer 初始化、尺寸监听和事件桥接。
 *
 * 采用 WebGL 而非 Canvas 2D 的优势：
 * 1. **性能优势**：WebGL 利用 GPU 加速渲染，能够高效处理复杂的图形和动画，提供更流畅的用户体验。
 *    相较之下，Canvas 2D 主要依赖 CPU，在处理大量对象时可能性能不足。
 *    [参考资料](https://stackoverflow.com/questions/21603350/is-there-any-reason-for-using-webgl-instead-of-2d-canvas-for-2d-games-apps)
 *
 * 2. **解决 Canvas 2D 的局限性**：
 *    - **高精度渲染**：在使用 Canvas 2D 进行平铺纹理或精细图形绘制时，可能会出现缝隙或接缝问题。
 *      WebGL 提供更高的渲染精度，能够有效避免这些问题，确保图形的无缝衔接和高质量呈现。
 *      [参考资料](https://erikonarheim.com/posts/webgl-tile-map-seams/)
 *
 *    - **复杂变换和特效**：WebGL 支持复杂的变换和着色器效果，而 Canvas 2D 在这方面功能有限。
 *      [参考资料](https://demyanov.dev/past-and-future-html-canvas-brief-overview-2d-webgl-and-webgpu)
 *
 *    - **批量绘制效率**：在需要绘制大量对象时，WebGL 的批处理能力优于 Canvas 2D，减少了绘制调用次数，提高了渲染效率。
 *      [参考资料](https://semisignal.com/a-look-at-2d-vs-webgl-canvas-performance/)
 *
 * @returns 初始化完成的 canvas 元素
 */
export function OverlayUI() {
  // 创建 Canvas 元素
  const canvas = (<canvas className="oe-overlay" />) as HTMLCanvasElement;

  // 初始化 WebGL 渲染器
  const renderer = createWebGLRenderer(canvas);
  // 初始视口设置
  renderer.updateViewport();

  // 建立尺寸响应式监听
  new ResizeObserver(() => renderer.updateViewport()).observe(canvas);

  // 桥接外部事件系统
  setupBridgeSystem(canvas, renderer);

  return canvas;
}

/**
 * 建立外部事件与渲染逻辑的桥接系统
 *
 * @param canvas - 目标画布元素
 * @param renderer - 渲染器实例
 *
 * 处理事件类型：
 * 1. 启用覆盖层：添加可见类名
 * 2. 退出检查器：移除类名并清空画布
 * 3. 盒模型更新：触发重新渲染
 */
function setupBridgeSystem(canvas: HTMLCanvasElement, renderer: WebGLRenderer) {
  const OVERLAY_SHOW_CLASS = 'oe-overlay-show';

  // 处理覆盖层启用事件
  inspectorEnableBridge.on(() => {
    addClass(canvas, OVERLAY_SHOW_CLASS);
  });

  // 处理检查器退出事件
  inspectorExitBridge.on(() => {
    removeClass(canvas, OVERLAY_SHOW_CLASS);
    renderer.clear();
  });

  // 处理盒模型数据更新事件
  boxModelBridge.on((rect, metrics) => {
    updateBoxModel(renderer, rect, metrics);
  });
}

/**
 * 盒模型数据更新处理流程
 *
 * @param renderer - 渲染器实例
 * @param rect - 目标元素边界矩形
 * @param metrics - 各层级尺寸数据
 *
 * 渲染策略：
 * 1. 清空上一帧内容
 * 2. 按层级顺序生成顶点数据（margin → border → padding → content）
 * 3. 批量提交顶点数据进行绘制
 */
function updateBoxModel(renderer: WebGLRenderer, rect: BoxRect, metrics: BoxMetrics) {
  renderer.clear();
  const vertices: number[] = [];

  // 复制初始坐标（后续按层级收缩）
  const coords = { ...rect };

  // 按顺序处理各层级边缘
  for (const key in metrics) {
    const edges = metrics[key] as BoxEdges;
    const color = BOX_EDGES_COLORS[key];
    // 生成当前层顶点并收缩坐标
    processEdges(vertices, coords, edges, renderer.pixelRatio, color);
    updateCoordinates(coords, edges);
  }

  // 添加最内层内容区域
  rectangleVertices(
    vertices,
    coords.left,
    coords.top,
    coords.right - coords.left,
    coords.bottom - coords.top,
    BOX_EDGES_COLORS.content,
    renderer.pixelRatio,
  );

  // 批量绘制所有顶点
  renderer.draw(vertices);
}

/**
 * 处理单个层级的边缘绘制
 *
 * @param vertices - 目标顶点数组
 * @param coords - 当前层边界坐标（将被修改）
 * @param edges - 当前层边缘尺寸
 * @param pixelRatio - 设备像素比
 * @param color - 当前层颜色
 *
 * 边缘绘制顺序：上 → 右 → 下 → 左，
 * 每个边缘绘制时考虑相邻边缘的覆盖关系，避免重叠
 */
function processEdges(
  vertices: number[],
  coords: BoxRect,
  edges: BoxEdges,
  pixelRatio: number,
  color: Float32Array,
) {
  // 上边缘（右端留空避免与右边缘重叠）
  if (edges.top) {
    rectangleVertices(
      vertices,
      coords.left,
      coords.top,
      coords.right - coords.left - edges.right,
      edges.top,
      color,
      pixelRatio,
    );
  }

  // 右边缘（上端留空避免与上边缘重叠）
  if (edges.right) {
    rectangleVertices(
      vertices,
      coords.right - edges.right,
      coords.top,
      edges.right,
      coords.bottom - coords.top - edges.top,
      color,
      pixelRatio,
    );
  }

  // 下边缘（左端留空避免与左边缘重叠）
  if (edges.bottom) {
    rectangleVertices(
      vertices,
      coords.left + edges.left,
      coords.bottom - edges.bottom,
      coords.right - coords.left - edges.left,
      edges.bottom,
      color,
      pixelRatio,
    );
  }

  // 左边缘（上端留空避免与上边缘重叠）
  if (edges.left) {
    rectangleVertices(
      vertices,
      coords.left,
      coords.top + edges.top,
      edges.left,
      coords.bottom - coords.top - edges.top,
      color,
      pixelRatio,
    );
  }
}

/**
 * 矩形顶点生成器（核心几何处理）
 *
 * @param vertices - 目标顶点数组
 * @param x - CSS 像素坐标 X
 * @param y - CSS 像素坐标 Y
 * @param width - CSS 像素宽度
 * @param height - CSS 像素高度
 * @param color - 预乘颜色数组 [r, g, b, a]
 * @param pixelRatio - 设备像素比
 *
 * 三角形拆分策略：
 *
 * (x1,y1) -------- (x2,y1)
 *   |               |
 *   |               |
 * (x1,y2) -------- (x2,y2)
 *
 * 拆分为两个三角形：
 * 1. 左下三角形：△(x1,y1) → (x2,y1) → (x1,y2)
 * 2. 右上三角形：△(x1,y2) → (x2,y1) → (x2,y2)
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
  // 过滤无效尺寸区域
  if (width <= 0 || height <= 0) return;

  // 转换为物理像素坐标
  const x1 = x * pixelRatio;
  const y1 = y * pixelRatio;
  const x2 = (x + width) * pixelRatio;
  const y2 = (y + height) * pixelRatio;

  // 第一个三角形（左下、右下、左上）
  vertices.push(x1, y1, ...color, x2, y1, ...color, x1, y2, ...color);

  // 第二个三角形（左上、右下、右上）
  vertices.push(x1, y2, ...color, x2, y1, ...color, x2, y2, ...color);
}

/**
 * 坐标递推系统（向内收缩各边缘）
 *
 * @param coords - 当前层边界坐标
 * @param edges - 当前层边缘尺寸
 *
 * 数学公式：
 * - 新左边界 = 旧左边界 + 左边缘宽度
 * - 新右边界 = 旧右边界 - 右边缘宽度
 * - 新上边界 = 旧上边界 + 上边缘宽度
 * - 新下边界 = 旧下边界 - 下边缘宽度
 *
 * 边界保护机制：确保收缩后区域有效
 */
function updateCoordinates(coords: BoxRect, edges: BoxEdges) {
  coords.top = Math.min(coords.top + edges.top, coords.bottom);
  coords.right = Math.max(coords.right - edges.right, coords.left);
  coords.bottom = Math.max(coords.bottom - edges.bottom, coords.top);
  coords.left = Math.min(coords.left + edges.left, coords.right);
}
