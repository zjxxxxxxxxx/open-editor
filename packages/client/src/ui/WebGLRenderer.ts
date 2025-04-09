import { getDOMRect } from '../utils/getDOMRect';

/**
 * WebGL 渲染器核心能力抽象
 */
export type WebGLRenderer = ReturnType<typeof createWebGLRenderer>;

/**
 * 创建 WebGL 渲染器实例
 *
 * @param canvas - 目标渲染画布
 *
 * @returns 完整渲染能力对象
 *
 * 初始化步骤：
 * 1. 获取 WebGL 上下文并进行基础配置
 * 2. 编译 GLSL 着色器程序
 * 3. 建立顶点缓冲区与属性指针
 * 4. 封装渲染操作方法
 */
export function createWebGLRenderer(canvas: HTMLCanvasElement) {
  const pixelRatio = window.devicePixelRatio || 1;
  const gl = getGLContext(canvas);
  const program = compileProgram(gl);

  // 激活初始着色器程序
  gl.useProgram(program);

  // 配置顶点数据系统
  const { buffer, vertexSize, u_resolution } = setupBufferAndAttributes(gl, program, canvas);

  return {
    gl,
    buffer,
    vertexSize,
    pixelRatio,

    /**
     * 视口更新协议
     *
     * 根据 Canvas 的布局尺寸更新绘图缓冲区和投影参数：
     * - 根据设备像素比缩放物理像素尺寸
     * - 更新 WebGL 视口和投影矩阵参数
     */
    updateViewport() {
      const rect = getDOMRect(canvas);

      // 根据设备像素比设置缓冲尺寸
      canvas.width = rect.width * pixelRatio;
      canvas.height = rect.height * pixelRatio;

      // 更新视口和投影参数
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (u_resolution) {
        gl.uniform2f(u_resolution, canvas.width, canvas.height);
      }
    },

    /**
     * 清屏操作
     *
     * 使用全透明颜色清除画布，准备新帧绘制
     */
    clear() {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    },

    /**
     * 顶点数据提交与绘制
     *
     * @param vertices - 扁平化顶点数组，格式为 [x, y, r, g, b, a, ...]
     */
    draw(vertices: number[]) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      const vertexArray = new Float32Array(vertices);

      // 动态更新顶点缓冲区数据
      gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STREAM_DRAW);

      // 提交绘制指令（三角形图元模式）
      gl.drawArrays(gl.TRIANGLES, 0, vertexArray.length / vertexSize);
    },
  };
}

/**
 * 配置 WebGL 上下文基础参数
 *
 * 关键配置项：
 * - preserveDrawingBuffer: 保持绘图缓冲，支持外部截图
 * - 混合模式: 使用 ONE + ONE_MINUS_SRC_ALPHA 实现预乘 Alpha 混合
 *
 * @param canvas - 目标画布元素
 *
 * @returns 初始化完成的 WebGL 上下文
 */
function getGLContext(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })!;

  // 启用预乘 Alpha 混合模式
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  return gl;
}

/**
 * 全量 GLSL 着色器编译流程
 *
 * @param gl - WebGL 渲染上下文
 *
 * @returns 链接完成的着色器程序
 *
 * 顶点着色器功能：
 * - 将 CSS 像素坐标转换为 WebGL 裁剪空间坐标
 * - 处理 Y 轴翻转（适配 WebGL 与 CSS 坐标系差异）
 * - 传递颜色数据到片段着色器
 *
 * 片段着色器功能：
 * - 直接使用顶点颜色输出，支持透明度混合
 */
function compileProgram(gl: WebGLRenderingContext) {
  // 顶点着色器源码（坐标系转换）
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec4 a_color;
    uniform vec2 u_resolution;
    varying vec4 v_color;
    
    void main() {
      // 转换到 [0,1] 标准化设备坐标
      vec2 zeroToOne = a_position / u_resolution;
      
      // 映射到 WebGL 裁剪空间（Y 轴翻转）
      vec2 clipSpace = zeroToOne * 2.0 - 1.0;
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
      
      v_color = a_color;
    }
  `;

  // 片段着色器源码（颜色输出）
  const fragmentShaderSource = `
    precision mediump float;
    varying vec4 v_color;
    
    void main() {
      gl_FragColor = v_color;
    }
  `;

  // 编译并链接着色器程序
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  return createProgram(gl, vertexShader, fragmentShader);
}

/**
 * 编译单个着色器
 *
 * @param gl - WebGL 上下文
 * @param type - 着色器类型（gl.VERTEX_SHADER 或 gl.FRAGMENT_SHADER）
 * @param source - GLSL 源码字符串
 *
 * @returns 编译后的着色器对象
 */
function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  return shader;
}

/**
 * 创建并链接着色器程序
 *
 * @param gl - WebGL 上下文
 * @param vertexShader - 已编译的顶点着色器
 * @param fragmentShader - 已编译的片段着色器
 *
 * @returns 链接完成的着色器程序
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
 * 配置顶点缓冲区与属性指针
 *
 * @param gl - WebGL 上下文
 * @param program - 着色器程序
 * @param canvas - 目标画布（用于初始投影设置）
 *
 * @returns 缓冲区相关配置对象
 *
 * 顶点数据结构说明：
 * - 每个顶点包含 2D 位置 + RGBA 颜色
 * - 内存布局：[x, y, r, g, b, a]
 * - 步长 stride = 6 个浮点数 × 4 字节 = 24 字节
 */
function setupBufferAndAttributes(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  canvas: HTMLCanvasElement,
) {
  // 获取着色器属性位置
  const a_position = gl.getAttribLocation(program, 'a_position');
  const a_color = gl.getAttribLocation(program, 'a_color');
  const u_resolution = gl.getUniformLocation(program, 'u_resolution');

  // 创建并绑定顶点缓冲区
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  // 配置顶点属性指针
  // 2(position) + 4(color)
  const vertexSize = 6;
  // 每个浮点数占 4 字节
  const stride = vertexSize * 4;

  // 位置属性配置（2 个浮点数，偏移 0）
  gl.enableVertexAttribArray(a_position);
  gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, stride, 0);

  // 颜色属性配置（4 个浮点数，偏移 8 字节）
  gl.enableVertexAttribArray(a_color);
  gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, stride, 2 * 4);

  // 初始设置投影分辨率
  if (u_resolution) {
    gl.uniform2f(u_resolution, canvas.width, canvas.height);
  }

  return { buffer, vertexSize, u_resolution };
}
