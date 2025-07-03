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
 * @returns 完整渲染能力对象
 */
export function createWebGLRenderer(canvas: HTMLCanvasElement, bufferSize: number) {
  const pixelRatio = window.devicePixelRatio || 1;
  const gl = initWebGLContext(canvas);
  const program = createShaderProgram(gl);

  // 激活初始着色器程序
  gl.useProgram(program);

  // 配置顶点属性
  const { buffer, vertexSize, u_resolution } = setupVertexAttributes(gl, program, canvas);
  let vertexArray: Float32Array | null = null;

  return {
    gl,
    buffer,
    vertexSize,
    pixelRatio,

    /**
     * 更新视口
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
     * @param clearBuffer - 可选，如果为 true，则释放用于存储顶点数据的 Float32Array 实例，将其设置为 null
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
      vertexArray ??= new Float32Array(bufferSize);
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
 * @param canvas - 目标画布元素
 * @returns 配置完成的 WebGL 上下文
 */
function initWebGLContext(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })!;
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  return gl;
}

/**
 * 构建并链接 GLSL 着色器程序
 *
 * @param gl - WebGL 渲染上下文
 * @returns 链接成功的着色器程序
 */
function createShaderProgram(gl: WebGLRenderingContext) {
  const vertexShaderSource = code`
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

  const fragmentShaderSource = code`
    precision mediump float;
    varying vec4 v_color;
    
    void main() {
      gl_FragColor = v_color;
    }
  `;

  const vertexShader = compileShaderObject(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShaderObject(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  return linkShaderProgram(gl, vertexShader, fragmentShader);
}

/**
 * 编译 GLSL 着色器对象
 *
 * @param gl - WebGL 渲染上下文
 * @param type - 着色器类型（VERTEX 或 FRAGMENT）
 * @param source - GLSL 源码
 * @returns 编译后的着色器对象
 */
function compileShaderObject(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

/**
 * 链接着色器程序
 *
 * @param gl - WebGL 渲染上下文
 * @param vertexShader - 编译后的顶点着色器
 * @param fragmentShader - 编译后的片段着色器
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
 * 设置顶点属性
 *
 * @param gl - WebGL 渲染上下文
 * @param program - 着色器程序
 * @param canvas - 目标画布（用于初始投影设置）
 * @returns 缓冲区及属性配置对象
 */
function setupVertexAttributes(
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
