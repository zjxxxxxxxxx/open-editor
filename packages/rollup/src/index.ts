import { resolve } from 'node:path';
import { type Plugin } from 'rollup';
import { isDev, resolvePath } from '@open-editor/shared/node';
import { CLIENT_MODULE_ID, ENTRY_MATCH_RE, injectClient, normalizePath } from '@open-editor/shared';
import { setupServer } from '@open-editor/server';

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
   * 服务端配置 | Server Configuration
   */
  server?: {
    /**
     * HTTPS安全传输层配置 | HTTPS Secure Transport Layer Configuration
     * @see [TLS Context Options](https://nodejs.org/api/tls.html#tlscreatesecurecontextoptions)
     * @example
     * {
     *   key: '/path/to/private.key',
     *   cert: '/path/to/certificate.pem'
     * }
     */
    https?: {
      /**
       * PEM格式的SSL私钥文件路径 | Path to PEM formatted SSL private key file
       * @fileMustExist 文件必须存在且可读 | File must exist and be readable
       */
      key: string;

      /**
       * PEM格式的SSL证书文件路径 | Path to PEM formatted SSL certificate file
       * @fileMustExist 文件必须存在且可读 | File must exist and be readable
       */
      cert: string;
    };
  };

  /**
   * 自定义编辑器打开处理器 | Custom editor opening handler
   *
   * @defaultValue `内置的launch-editor实现 | Built-in launch-editor implementation`
   * @remarks
   * 覆盖默认的文件打开逻辑 | Override default file opening behavior
   */
  onOpenEditor?(file: string): void;
}

/**
 * 开发环境端口缓存池 | Cache pool for development environment ports
 */
const portPromiseCache: Record<string, Promise<number>> = {};

/**
 * 开发环境专用编辑器调试插件 | Dev-only Editor Debugging Plugin
 * @remarks
 * 仅在开发模式下生效 | Only active in development mode
 */
export default function OpenEditorPlugin(options: Options = {}): Plugin | undefined {
  // 非开发环境返回空插件 | Return empty plugin in non-dev environments
  if (!isDev()) {
    return { name: 'OpenEditorPlugin' }; // 空名称插件占位符 | Placeholder for empty plugin
  }

  const { onOpenEditor } = options;
  const rootDir = normalizePath(options.rootDir ? resolve(options.rootDir) : process.cwd());

  let serverPort: number; // 服务器端口缓存 | Cached server port

  return {
    name: 'OpenEditorPlugin', // 遵循Rollup插件命名规范 | Follow Rollup plugin naming convention

    /**
     * 构建启动阶段初始化服务 | Initialize server during build start phase
     */
    async buildStart() {
      const cacheKey = `${rootDir}${onOpenEditor}`;
      serverPort = await (portPromiseCache[cacheKey] ||= setupServer({
        ...(options.server ?? {}), // 合并服务器配置 | Merge server configuration
        rootDir, // 标准化根目录路径 | Normalized root directory path
        onOpenEditor, // 自定义编辑器处理器 | Custom editor handler
      }));
    },

    /**
     * 解析客户端模块ID | Resolve client module ID
     * @param id - 模块标识符 | Module identifier
     * @returns 处理后的模块路径 | Processed module path
     */
    resolveId(id: string) {
      if (id === CLIENT_MODULE_ID) {
        // 确保ES模块兼容性 | Ensure ES module compatibility[[1][4]]
        return resolvePath(CLIENT_MODULE_ID, import.meta.url).replace(/\.js$/, '.mjs'); // 强制使用ES模块扩展名 | Enforce ES module extension
      }
    },

    /**
     * 转换入口文件注入客户端代码 | Transform entry files to inject client code
     * @param code - 原始代码内容 | Original code content
     * @param id - 文件路径标识 | File path identifier
     * @returns 转换后的代码 | Transformed code
     */
    transform(code: string, id: string) {
      if (ENTRY_MATCH_RE.test(id)) {
        return injectClient(code, {
          ...options, // 传递插件配置 | Pass plugin configuration
          rootDir, // 标准化根目录 | Normalized root directory
          port: serverPort, // 注入服务器端口 | Inject server port
        });
      }
    },
  };
}
