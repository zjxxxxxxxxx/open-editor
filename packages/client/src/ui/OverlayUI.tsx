import { addClass, removeClass } from '../utils/dom';
import {
  type BoxLine,
  type BoxLines,
  type BoxRect,
  getDefaultBoxModel,
} from '../inspector/getBoxModel';
import { inspectorEnableBridge, inspectorExitBridge, boxModelBridge } from '../bridge';
import { getDOMRect } from '../utils/getDOMRect';

// 开发者工具标准配色规范（RGBA格式实现半透明效果）
const LAYER_COLORS = {
  margin: 'rgba(246, 178, 107, 0.66)', // 橙色：margin 区域（透明度 66%）
  border: 'rgba(255, 229, 152, 0.66)', // 黄色：border 区域
  padding: 'rgba(137, 196, 125, 0.55)', // 绿色：padding 区域
  content: 'rgba(111, 168, 220, 0.66)', // 蓝色：content 区域
};

/**
 * 盒模型可视化叠加层组件
 * 核心功能：通过四层矩形叠加绘制实现盒模型可视化
 * 生命周期流程：
 * 1. 初始化阶段：创建画布、设置尺寸、初始化事件监听
 * 2. 激活阶段：接收检测器启用信号，显示画布
 * 3. 渲染阶段：接收盒模型数据，分层绘制矩形
 * 4. 销毁阶段：接收退出信号，隐藏画布并重置状态
 */
export function OverlayUI() {
  // 常量定义
  const OVERLAY_SHOW_CLASS = 'oe-overlay-show'; // 显示状态类名

  // 初始化画布系统
  const [canvas, context] = initializeCanvasSystem();

  // 初始化事件桥接系统
  initializeBridgeSystem(canvas, context);

  // 返回初始化完成的画布元素
  return canvas;

  /* -------------------- 画布初始化系统 -------------------- */
  function initializeCanvasSystem() {
    // 步骤1：创建画布元素
    const canvas = (<canvas className="oe-overlay" />) as HTMLCanvasElement;

    // 步骤2：获取2D渲染上下文
    const context = canvas.getContext('2d')!; // TS非空断言（canvas元素必定支持2d上下文）

    // 步骤3：配置画布参数
    configureCanvas(canvas, context);

    // 步骤4：当canvas元素尺寸变化使重设画布参数
    new ResizeObserver(() => configureCanvas(canvas, context)).observe(canvas);

    return [canvas, context] as const;
  }

  // 配置画布参数（设备像素比/坐标系处理）
  function configureCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const { width, height } = getDOMRect(canvas);
    const pixelRatio = window.devicePixelRatio || 1;

    // 物理像素尺寸（实际渲染分辨率）
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;

    // 坐标系处理（解决Retina屏幕模糊问题）
    ctx.scale(pixelRatio, pixelRatio);
    ctx.translate(0.5, 0.5); // 0.5像素偏移解决抗锯齿问题
  }

  /* -------------------- 事件桥接系统 -------------------- */
  function initializeBridgeSystem(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    // 绑定事件监听
    inspectorEnableBridge.on(handleInspectorEnable);
    inspectorExitBridge.on(handleInspectorExit);
    boxModelBridge.on(handleBoxModelUpdate);

    // 事件处理器：开发者工具启用
    function handleInspectorEnable() {
      addClass(canvas, OVERLAY_SHOW_CLASS);
    }

    // 事件处理器：开发者工具关闭
    function handleInspectorExit() {
      removeClass(canvas, OVERLAY_SHOW_CLASS);
      updateBoxModel(ctx, ...getDefaultBoxModel());
    }

    // 事件处理器：盒模型数据更新
    function handleBoxModelUpdate(rect: BoxRect, lines: BoxLines) {
      updateBoxModel(ctx, rect, lines);
    }
  }

  /* -------------------- 盒模型渲染系统 -------------------- */
  /**
   * 盒模型可视化渲染引擎
   * @param rect - 元素包围盒 {top, right, bottom, left}
   * @param lines - 盒模型四边数据 {margin, border, padding}
   */
  function updateBoxModel(ctx: CanvasRenderingContext2D, rect: BoxRect, lines: BoxLines) {
    // 准备渲染环境
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();

    // 初始化坐标值（使用对象副本避免污染原始数据）
    const coordinates = { ...rect };

    // 分层绘制流程（外层到内层）
    Object.keys(lines).forEach((key) => {
      const line = lines[key] as BoxLine;
      drawLayer(ctx, coordinates, line, LAYER_COLORS[key]);
      updateCoordinates(coordinates, line);
    });

    // 绘制最内层内容区域
    drawContentArea(ctx, coordinates);

    // 恢复渲染环境
    ctx.restore();
  }

  // 绘制单个层级（四边区域）
  function drawLayer(
    ctx: CanvasRenderingContext2D,
    coords: BoxRect,
    layer: BoxLine,
    color: string,
  ) {
    ctx.fillStyle = color;

    // 上边区域（水平矩形）
    if (layer.top)
      drawRectArea(ctx, {
        x: coords.left,
        y: coords.top,
        width: coords.right - coords.left - layer.right,
        height: layer.top,
      });

    // 右边区域（垂直矩形）
    if (layer.right)
      drawRectArea(ctx, {
        x: coords.right - layer.right,
        y: coords.top,
        width: layer.right,
        height: coords.bottom - coords.top - layer.bottom,
      });

    // 下边区域（水平矩形）
    if (layer.bottom)
      drawRectArea(ctx, {
        x: coords.left + layer.left,
        y: coords.bottom - layer.bottom,
        width: coords.right - coords.left - layer.left,
        height: layer.bottom,
      });

    // 左边区域（垂直矩形）
    if (layer.left)
      drawRectArea(ctx, {
        x: coords.left,
        y: coords.top + layer.top,
        width: layer.left,
        height: coords.bottom - coords.top - layer.top,
      });
  }

  // 坐标递进系统（为下一层准备绘制区域）
  function updateCoordinates(coords: BoxRect, layer: BoxLine) {
    coords.top += layer.top;
    coords.right -= layer.right;
    coords.bottom -= layer.bottom;
    coords.left += layer.left;
  }

  // 绘制内容区域（最内层）
  function drawContentArea(ctx: CanvasRenderingContext2D, coords: BoxRect) {
    ctx.fillStyle = LAYER_COLORS.content;
    drawRectArea(ctx, {
      x: coords.left,
      y: coords.top,
      width: coords.right - coords.left,
      height: coords.bottom - coords.top,
    });
  }

  // 绘制矩形区域
  function drawRectArea(
    ctx: CanvasRenderingContext2D,
    options: { x: number; y: number; width: number; height: number },
  ) {
    if (options.height > 0 && options.width > 0) {
      ctx.fillRect(options.x, options.y, options.width, options.height);
    }
  }
}
