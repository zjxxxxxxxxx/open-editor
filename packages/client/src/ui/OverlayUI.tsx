import { addClass, removeClass } from '../utils/dom';
import { getDOMRect } from '../utils/getDOMRect';
import {
  type BoxLine,
  type BoxLines,
  type BoxRect,
  getDefaultBoxModel,
} from '../inspector/getBoxModel';
import { inspectorEnableBridge, inspectorExitBridge, boxModelBridge } from '../bridge';

type WebGLRenderer = ReturnType<typeof createRenderer>;

/**
 * Chrome 盒模型图层配色系统（RGBA 预乘透明度通道）
 * 这些颜色用于绘制 margin、border、padding 以及内容区域。
 * 使用预乘 alpha 后的 [r, g, b, a] 数组，可直接用于 WebGL 填色，无需运行时转换。
 */
const LAYER_COLORS = {
  // 橙色：rgba(246, 178, 107, 0.66) => [0.636, 0.460, 0.277, 0.66]
  margin: new Float32Array([0.636, 0.46, 0.277, 0.66]),
  // 米黄色：rgba(255, 229, 152, 0.66) => [1.000, 0.898, 0.396, 0.66]
  border: new Float32Array([0.66, 0.592, 0.394, 0.66]),
  // 绿色：rgba(137, 196, 125, 0.55) => [0.295, 0.424, 0.270, 0.55]
  padding: new Float32Array([0.295, 0.424, 0.27, 0.55]),
  // 蓝色：rgba(111, 168, 220, 0.66) => [0.287, 0.435, 0.570, 0.66]
  content: new Float32Array([0.287, 0.435, 0.57, 0.66]),
};

/**
 * 创建 OverlayUI，完成 canvas 创建、WebGLRenderer 初始化、尺寸监听和事件桥接。
 *
 * 采用 WebGL 而非 Canvas 2D 的优势：
 *
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
  const canvas = (<canvas className="oe-overlay" />) as HTMLCanvasElement;
  const renderer = createRenderer(canvas);
  renderer.updateViewport();
  new ResizeObserver(() => renderer.updateViewport()).observe(canvas);
  setupBridgeSystem(canvas, renderer);
  return canvas;
}

/**
 * 创建 WebGL 渲染器对象，拆分了获取上下文、编译着色器、设置缓冲区等步骤。
 * @param canvas - 用于渲染的 canvas 元素
 * @returns 渲染器对象，包含更新视口、清屏和绘制方法
 */
function createRenderer(canvas: HTMLCanvasElement) {
  const pixelRatio = window.devicePixelRatio || 1;
  const gl = getGLContext(canvas);
  const program = compileShadersAndProgram(gl);
  gl.useProgram(program);
  const { buffer, vertexSize, u_resolution } = setupBufferAndAttributes(gl, program, canvas);
  return {
    gl,
    buffer,
    vertexSize,
    pixelRatio,
    updateViewport() {
      const rect = getDOMRect(canvas);
      canvas.width = rect.width * pixelRatio;
      canvas.height = rect.height * pixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (u_resolution) {
        gl.uniform2f(u_resolution, canvas.width, canvas.height);
      }
    },
    clear() {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    },
    draw(vertices: number[]) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      const vertexArray = new Float32Array(vertices);
      gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STREAM_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, vertexArray.length / vertexSize);
    },
  };
}

/**
 * 获取 WebGL 上下文，并进行基本设置。
 * @param canvas - 用于渲染的 canvas 元素
 * @returns WebGLRenderingContext 对象
 */
function getGLContext(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })!;
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  return gl;
}

/**
 * 编译顶点和片元着色器，并创建 WebGL 程序。
 * @param gl - WebGL 渲染上下文
 * @returns WebGLProgram 对象
 */
function compileShadersAndProgram(gl: WebGLRenderingContext) {
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec4 a_color;
    uniform vec2 u_resolution;
    varying vec4 v_color;
    void main(){
      vec2 zeroToOne = a_position / u_resolution;
      vec2 clipSpace = zeroToOne * 2.0 - 1.0;
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
      v_color = a_color;
    }
  `;
  const fragmentShaderSource = `
    precision mediump float;
    varying vec4 v_color;
    void main(){
      gl_FragColor = v_color;
    }
  `;
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  return createProgram(gl, vertexShader, fragmentShader);
}

/**
 * 创建 WebGL 着色器。
 * @param gl - WebGL 渲染上下文
 * @param type - 着色器类型（gl.VERTEX_SHADER 或 gl.FRAGMENT_SHADER）
 * @param source - 着色器源码
 * @returns 编译后的着色器
 */
function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

/**
 * 创建 WebGL 程序，将顶点与片元着色器链接起来。
 * @param gl - WebGL 渲染上下文
 * @param vertexShader - 编译后的顶点着色器
 * @param fragmentShader - 编译后的片元着色器
 * @returns 链接后的 WebGL 程序
 */
function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
) {
  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  return program;
}

/**
 * 设置顶点缓冲区及属性指针。
 * @param gl - WebGL 渲染上下文
 * @param program - WebGL 程序对象
 * @param canvas - 用于渲染的 canvas 元素
 * @returns 包含缓冲区、顶点大小和 u_resolution 位置的对象
 */
function setupBufferAndAttributes(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  canvas: HTMLCanvasElement,
) {
  const a_position = gl.getAttribLocation(program, 'a_position');
  const a_color = gl.getAttribLocation(program, 'a_color');
  const u_resolution = gl.getUniformLocation(program, 'u_resolution');
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const vertexSize = 6; // 2 (位置) + 4 (颜色)
  const stride = vertexSize * 4; // 每个浮点数 4 字节
  gl.enableVertexAttribArray(a_position);
  gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(a_color);
  gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, stride, 2 * 4);
  if (u_resolution) {
    gl.uniform2f(u_resolution, canvas.width, canvas.height);
  }
  return { buffer, vertexSize, u_resolution };
}

/**
 * 初始化事件桥接，将外部事件与绘制逻辑关联。
 * 当接收到启用、退出或盒模型更新事件时，调用相应函数进行处理。
 * @param canvas - 用于显示的 canvas 元素
 * @param renderer - 渲染器对象
 */
function setupBridgeSystem(canvas: HTMLCanvasElement, renderer: WebGLRenderer) {
  const OVERLAY_SHOW_CLASS = 'oe-overlay-show';
  inspectorEnableBridge.on(() => {
    addClass(canvas, OVERLAY_SHOW_CLASS);
  });
  inspectorExitBridge.on(() => {
    removeClass(canvas, OVERLAY_SHOW_CLASS);
    updateBoxModel(renderer, ...getDefaultBoxModel());
  });
  boxModelBridge.on((rect, lines) => {
    updateBoxModel(renderer, rect, lines);
  });
}

/**
 * 根据盒模型数据生成所有矩形的顶点数据，并调用 renderer.draw() 批量绘制。
 * 绘制顺序为：margin → border → padding → content
 * @param renderer - 渲染器对象，由 createRenderer() 创建
 * @param rect - 初始盒模型边界（包含 top/right/bottom/left）
 * @param lines - 盒模型各层数据（margin, border, padding）
 */
function updateBoxModel(renderer: WebGLRenderer, rect: BoxRect, lines: BoxLines) {
  renderer.clear();
  const vertices: number[] = [];
  const coords = { ...rect };
  for (const key in lines) {
    const line = lines[key] as BoxLine;
    const lineVertices = processLayer(coords, line, renderer.pixelRatio, LAYER_COLORS[key]);
    vertices.push(...lineVertices);
  }
  // 绘制内容区域（最内层）
  const contentVertices = rectangleVertices(
    coords.left,
    coords.top,
    coords.right - coords.left,
    coords.bottom - coords.top,
    LAYER_COLORS.content,
    renderer.pixelRatio,
  );
  vertices.push(...contentVertices);
  // 批量绘制所有顶点数据
  renderer.draw(vertices);
}

/**
 * 处理单一层（margin、border 或 padding）的绘制。
 * 根据传入的边距数据，生成各边的顶点数据，并更新边界。
 * @param coords - 当前绘制区域边界（将被修改）
 * @param line - 当前层的盒模型数据
 * @param pixelRatio - 当前设备像素比
 * @param color - 该层预乘 alpha 后的颜色
 * @returns 生成的顶点数据数组
 */
function processLayer(coords: BoxRect, line: BoxLine, pixelRatio: number, color: Float32Array) {
  const vertices: number[] = [];
  if (line.top) {
    const topVertices = rectangleVertices(
      coords.left,
      coords.top,
      coords.right - coords.left - line.right,
      line.top,
      color,
      pixelRatio,
    );
    vertices.push(...topVertices);
  }
  if (line.right) {
    const rightVertices = rectangleVertices(
      coords.right - line.right,
      coords.top,
      line.right,
      coords.bottom - coords.top - line.top,
      color,
      pixelRatio,
    );
    vertices.push(...rightVertices);
  }
  if (line.bottom) {
    const bottomVertices = rectangleVertices(
      coords.left + line.left,
      coords.bottom - line.bottom,
      coords.right - coords.left - line.left,
      line.bottom,
      color,
      pixelRatio,
    );
    vertices.push(...bottomVertices);
  }
  if (line.left) {
    const leftVertices = rectangleVertices(
      coords.left,
      coords.top + line.top,
      line.left,
      coords.bottom - coords.top - line.top,
      color,
      pixelRatio,
    );
    vertices.push(...leftVertices);
  }
  // 更新边界进入内层区域
  updateCoordinates(coords, line);
  return vertices;
}

/**
 * 根据矩形区域及颜色生成顶点数据。
 * 将一个矩形拆分为两个三角形，每个顶点包含 6 个数据：x, y, r, g, b, a。
 * 注意：坐标会乘以设备像素比，以匹配物理像素分辨率。
 * @param x - 矩形左上角 x 坐标（CSS 像素）
 * @param y - 矩形左上角 y 坐标（CSS 像素）
 * @param width - 矩形宽度（CSS 像素）
 * @param height - 矩形高度（CSS 像素）
 * @param color - 预乘 alpha 后的颜色数组 [r, g, b, a]
 * @param pixelRatio - 当前设备的像素比
 * @returns 顶点数据数组（若宽或高不合法则返回空数组）
 */
function rectangleVertices(
  x: number,
  y: number,
  width: number,
  height: number,
  color: Float32Array,
  pixelRatio: number,
) {
  if (width <= 0 || height <= 0) return [];
  const x1 = x * pixelRatio;
  const y1 = y * pixelRatio;
  const x2 = (x + width) * pixelRatio;
  const y2 = (y + height) * pixelRatio;
  return [
    // 第一个三角形
    x1,
    y1,
    ...color,
    x2,
    y1,
    ...color,
    x1,
    y2,
    ...color,
    // 第二个三角形
    x1,
    y2,
    ...color,
    x2,
    y1,
    ...color,
    x2,
    y2,
    ...color,
  ];
}

/**
 * 坐标递进系统（为下一层准备绘制区域）
 * @param coords - 当前绘制区域边界（将被修改）
 * @param layer - 当前层的盒模型数据
 */
function updateCoordinates(coords: BoxRect, layer: BoxLine) {
  coords.top += layer.top;
  coords.right -= layer.right;
  coords.bottom -= layer.bottom;
  coords.left += layer.left;
}
