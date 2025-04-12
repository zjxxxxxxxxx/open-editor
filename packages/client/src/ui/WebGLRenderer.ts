import { getDOMRect } from '../utils/getDOMRect';

/**
 * WebGL 渲染器核心能力抽象
 */
export type WebGLRenderer = ReturnType<typeof createWebGLRenderer>;

/**
 * 初始化 WebGL 渲染器实例
 *
 * @param canvas - 目标渲染画布
 * @param bufferSize - 缓冲区大小
 *
 * @returns 完整渲染能力对象
 *
 * 初始化步骤：
 * 1. 获取并配置 WebGL 上下文
 * 2. 编译并链接 GLSL 着色器程序
 * 3. 配置顶点缓冲区与属性指针
 * 4. 封装渲染操作方法
 */
export function createWebGLRenderer(canvas: HTMLCanvasElement, bufferSize: number) {
  const pixelRatio = window.devicePixelRatio || 1;
  const gl = createWebGLContext(canvas);
  const program = buildShaderProgram(gl);

  // 激活初始着色器程序
  gl.useProgram(program);

  // 配置顶点数据系统
  const { buffer, vertexSize, u_resolution } = configureVertexBufferAttributes(gl, program, canvas);
  let vertexArray: Float32Array | null;

  return {
    gl,
    buffer,
    vertexSize,
    pixelRatio,

    /**
     * 更新视口
     *
     * 根据 Canvas 布局尺寸更新绘图缓冲区和投影参数：
     * - 按设备像素比缩放物理尺寸
     * - 更新 WebGL 视口和投影矩阵参数
     */
    updateViewport() {
      const rect = getDOMRect(canvas);
      const pr = pixelRatio;
      canvas.width = rect.width * pr;
      canvas.height = rect.height * pr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (u_resolution) {
        gl.uniform2f(u_resolution, canvas.width, canvas.height);
      }
    },

    /**
     * 清空画布
     *
     * @param clearBuffer - 可选，如果为 true，则释放用于存储顶点数据的 Float32Array 实例，将其设置为 null。
     *
     * 使用全透明颜色清除画布，为新帧绘制作准备。
     */
    clear(clearBuffer?: boolean) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (clearBuffer) vertexArray = null;
    },

    /**
     * 绘制顶点数据
     *
     * @param vertices - 扁平化顶点数组，格式为 [x, y, r, g, b, a, ...]
     */
    draw(vertices: number[]) {
      vertexArray ||= new Float32Array(bufferSize);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      vertexArray.set(vertices);
      gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STREAM_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, vertices.length / vertexSize);
    },
  };
}

/**
 * 初始化并配置 WebGL 上下文
 *
 * 关键配置：
 * - preserveDrawingBuffer: 保持绘图缓冲，支持截屏
 * - 启用混合：使用 ONE 与 ONE_MINUS_SRC_ALPHA 进行预乘 Alpha 混合
 *
 * @param canvas - 目标画布元素
 *
 * @returns 配置完成的 WebGL 上下文
 */
function createWebGLContext(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })!;
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  return gl;
}

/**
 * 编译并链接 GLSL 着色器程序
 *
 * @param gl - WebGL 渲染上下文
 *
 * @returns 链接成功的着色器程序
 */
function buildShaderProgram(gl: WebGLRenderingContext) {
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec4 a_color;
    uniform vec2 u_resolution;
    varying vec4 v_color;
    
    void main() {
      vec2 zeroToOne = a_position / u_resolution;
      vec2 clipSpace = zeroToOne * 2.0 - 1.0;
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
      v_color = a_color;
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    varying vec4 v_color;
    
    void main() {
      gl_FragColor = v_color;
    }
  `;

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  return linkShaderProgram(gl, vertexShader, fragmentShader);
}

/**
 * 编译指定类型着色器
 *
 * @param gl - WebGL 渲染上下文
 * @param type - 着色器类型（VERTEX 或 FRAGMENT）
 * @param source - GLSL 源码
 *
 * @returns 编译后的着色器对象
 */
function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

/**
 * 链接顶点和片段着色器生成程序
 *
 * @param gl - WebGL 渲染上下文
 * @param vertexShader - 编译后的顶点着色器
 * @param fragmentShader - 编译后的片段着色器
 *
 * @returns 链接成功的着色器程序
 */
function linkShaderProgram(
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
 * @param gl - WebGL 渲染上下文
 * @param program - 着色器程序
 * @param canvas - 目标画布（用于初始投影设置）
 *
 * @returns 缓冲区及属性配置对象
 *
 * 顶点数据格式：[x, y, r, g, b, a] 共 6 个浮点数，每个顶点步长 24 字节
 */
function configureVertexBufferAttributes(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  canvas: HTMLCanvasElement,
) {
  const a_position = gl.getAttribLocation(program, 'a_position');
  const a_color = gl.getAttribLocation(program, 'a_color');
  const u_resolution = gl.getUniformLocation(program, 'u_resolution');

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  const vertexSize = 6;
  const stride = vertexSize * 4;

  gl.enableVertexAttribArray(a_position);
  gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, stride, 0);

  gl.enableVertexAttribArray(a_color);
  gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, stride, 2 * 4);

  if (u_resolution) {
    gl.uniform2f(u_resolution, canvas.width, canvas.height);
  }

  return { buffer, vertexSize, u_resolution };
}
