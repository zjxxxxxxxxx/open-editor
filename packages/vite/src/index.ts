import { resolve } from 'node:path';
import { type ViteDevServer } from 'vite';
import { CLIENT_MODULE_ID, ServerApis, injectClient, normalizePath } from '@open-editor/shared';
import { isDev, resolvePath } from '@open-editor/shared/node';
import { openEditorMiddleware } from '@open-editor/server';

/**
 * 插件配置选项 | Plugin Configuration Options
 */
export interface Options {
  /**
   * 源代码根目录路径 | Source code root directory path
   *
   * @defaultValue `process.cwd()`
   * @example
   * ```ts
   * rootDir: path.resolve(__dirname, 'src')
   * ```
   */
  rootDir?: string;

  /**
   * 在浏览器显示切换按钮 | Display toggle button in browser
   *
   * @defaultValue `true`
   * @remarks
   * 控制是否在页面右下角显示调试开关 | Controls whether to show debug toggle at bottom-right corner
   */
  displayToggle?: boolean;

  /**
   * 禁用CSS悬停效果 | Disable CSS hover effects
   *
   * @defaultValue `true`
   * @remarks
   * 当检查器启用时禁用元素悬停高亮 | Disable element highlighting on hover when inspector is active
   */
  disableHoverCSS?: boolean;

  /**
   * 忽略指定目录的组件 | Ignore components in specified directories
   *
   * @defaultValue `'\/**\/node_modules\/**\/*'`
   * @see [Glob Pattern Syntax](https://en.wikipedia.org/wiki/Glob_(programming))
   * @remarks
   * 使用glob模式匹配需要忽略的路径 |
   * Use glob patterns to match ignored paths
   */
  ignoreComponents?: string | string[];

  /**
   * 单次检查模式 | Single-inspection mode
   *
   * @defaultValue `true`
   * @remarks
   * 打开编辑器或组件树后自动退出检查状态 | Automatically exit inspection after opening editor or component tree
   */
  once?: boolean;

  /**
   * 跨iframe交互支持 | Cross-iframe interaction
   *
   * @defaultValue `true`
   * @remarks
   * 允许在子iframe中提升操作到父窗口（仅限同源）| Enable elevating operations from child iframes to parent window (same-origin only)
   */
  crossIframe?: boolean;

  /**
   * 自定义编辑器打开处理器 | Custom editor opening handler
   *
   * @defaultValue `内置的launch-editor实现 | Built-in launch-editor implementation`
   * @remarks
   * 覆盖默认的文件打开逻辑 | Override default file opening behavior
   */
  onOpenEditor?(file: string): void;
}

const CLIENT_ID = '/client.mjs'; // 客户端模块虚拟路径 | Client module virtual path

/**
 * Vite插件：开发环境下启用组件源码定位功能 | Vite Plugin: Enable component source code location in development
 *
 * @param options - 插件配置选项 | Plugin configuration options
 * @returns Vite插件对象 | Vite plugin instance
 *
 * @remarks
 * 技术实现要点 | Technical highlights:
 * - 虚拟模块处理客户端配置注入 | Virtual module handling for client config injection
 * - 中间件处理编辑器打开请求 | Middleware handling editor opening requests
 * - 开发环境专属优化 | Development environment optimizations
 */
export default function OpenEditorPlugin(options: Options = {}) {
  // 非开发环境返回空插件 | Return empty plugin in non-dev environments
  if (!isDev()) {
    return { name: 'OpenEditorPlugin' };
  }

  // 配置标准化处理 | Configuration normalization
  const { onOpenEditor } = options;
  const rootDir = normalizePath(options.rootDir ? resolve(options.rootDir) : process.cwd());

  return {
    name: 'OpenEditorPlugin',
    apply: <const>'serve', // 仅开发环境生效 | Activate only in dev mode

    /**
     * 开发服务器配置 | Dev server configuration
     *
     * @remarks
     * 注册中间件处理编辑器打开请求 | Register middleware to handle editor opening requests
     */
    configureServer(server: Pick<ViteDevServer, 'middlewares'>) {
      server.middlewares.use(
        ServerApis.OPEN_EDITOR, // API端点路径 | API endpoint path
        openEditorMiddleware({
          rootDir, // 项目根目录 | Project root directory
          onOpenEditor, // 自定义打开处理器 | Custom opening handler
        }),
      );
    },

    /**
     * 模块解析逻辑 | Module resolution logic
     *
     * @remarks
     * 处理客户端模块的虚拟路径映射 | Handle virtual path mapping for client module
     */
    resolveId(id) {
      if (id === CLIENT_MODULE_ID) {
        return resolvePath(CLIENT_MODULE_ID, import.meta.url).replace(/\.js$/, '.mjs'); // 确保ES模块兼容性 | Ensure ES module compatibility
      }
    },

    /**
     * 代码转换逻辑 | Code transformation
     *
     * @remarks
     * 向客户端注入运行时配置 | Inject runtime configuration into client code
     */
    transform(code: string, id: string) {
      if (id.endsWith(CLIENT_ID)) {
        return injectClient(code, {
          // 注入配置参数 | Inject configuration
          ...options, // 用户配置 | User options
          rootDir, // 处理后的根目录 | Processed root directory
        });
      }
    },
  };
}
