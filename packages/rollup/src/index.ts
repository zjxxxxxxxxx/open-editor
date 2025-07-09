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
   * @default `process.cwd()`
   * @example
   * ```ts
   * rootDir: path.resolve(__dirname, 'src')
   * ```
   */
  rootDir?: string;

  /**
   * 在浏览器显示切换按钮 | Display toggle button in browser
   * @default `true`
   * @remarks
   * 控制是否在页面右下角显示调试开关 | Controls whether to show debug toggle at bottom-right corner
   */
  displayToggle?: boolean;

  /**
   * 禁用 CSS 悬停效果 | Disable CSS hover effects
   * @default `true`
   * @remarks
   * 当检查器启用时禁用元素悬停高亮 | Disable element highlighting on hover when inspector is active
   */
  disableHoverCSS?: boolean;

  /**
   * 忽略指定目录的组件 | Ignore components in specified directories
   * @default `\/**\/node_modules\/**\/*`
   * @see [Glob Pattern Syntax](https://en.wikipedia.org/wiki/Glob_(programming))
   * @remarks
   * 使用 glob 模式匹配需要忽略的路径 | Use glob patterns to match ignored paths
   */
  ignoreComponents?: string | string[];

  /**
   * 单次检查模式 | Single-inspection mode
   * @default `true`
   * @remarks
   * 打开编辑器或组件树后自动退出检查状态 | Automatically exit inspection after opening editor or component tree
   */
  once?: boolean;

  /**
   * 跨 iframe 交互支持 | Cross-iframe interaction
   * @default `true`
   * @remarks
   * 允许在子 iframe 中提升操作到父窗口（仅限同源）| Enable elevating operations from child iframes to parent window (same-origin only)
   */
  crossIframe?: boolean;

  /**
   * 服务端配置 | Server Configuration
   */
  server?: {
    /**
     * 自定义端口号 | Custom port
     */
    port?: number;
    /**
     * HTTPS 安全传输层配置 | HTTPS Secure Transport Layer Configuration
     * @see [TLS Context Options](https://nodejs.org/api/tls.html#tlscreatesecurecontextoptions)
     * @example
     * {
     *   key: '/path/to/private.key',
     *   cert: '/path/to/certificate.pem'
     * }
     */
    https?: {
      /**
       * PEM 格式的 SSL 私钥文件路径 | Path to PEM formatted SSL private key file
       * @fileMustExist 文件必须存在且可读 | File must exist and be readable
       */
      key: string;

      /**
       * PEM 格式的 SSL 证书文件路径 | Path to PEM formatted SSL certificate file
       * @fileMustExist 文件必须存在且可读 | File must exist and be readable
       */
      cert: string;
    };
  };

  /**
   * 自定义编辑器打开处理器 | Custom editor opening handler
   * @default `launch-editor`
   * @remarks
   * 覆盖默认的文件打开逻辑 | Override default file opening behavior
   */
  onOpenEditor?(file: string, errorCallback: (errorMessage: string) => void): void;
}

// 插件名称 | Plugin name
const PLUGIN_NAME = 'OpenEditorPlugin';

/**
 * 开发环境端口缓存池 | Cache pool for development environment ports
 */
const portPromiseCache: Record<string, Promise<number>> = {};

/**
 * 开发环境下启用组件源码定位功能 | Enable component source code location in development
 */
export default function OpenEditorPlugin(options: Options = {}): Plugin | undefined {
  // 非开发环境返回空插件 | Return empty plugin in non-dev environments
  if (!isDev()) return { name: PLUGIN_NAME };

  const { onOpenEditor } = options;
  const rootDir = normalizePath(options.rootDir ? resolve(options.rootDir) : process.cwd());

  // 服务器端口缓存 | Cached server port
  let serverPort: number;

  return {
    name: PLUGIN_NAME,

    /**
     * 构建启动阶段初始化服务 | Initialize server during build start phase
     */
    async buildStart() {
      const cacheKey = `${rootDir}${onOpenEditor}`;
      serverPort = await (portPromiseCache[cacheKey] ||= setupServer({
        // 合并服务器配置 | Merge server configuration
        ...(options.server ?? {}),
        // 标准化根目录路径 | Normalized root directory path
        rootDir,
        // 自定义编辑器处理器 | Custom editor handler
        onOpenEditor,
      }));
    },

    /**
     * 解析客户端模块 ID | Resolve client module ID
     * @param id - 模块标识符 | Module identifier
     * @returns 处理后的模块路径 | Processed module path
     */
    resolveId(id: string) {
      if (id === CLIENT_MODULE_ID) {
        // 强制使用 ES 模块扩展名 | Enforce ES module extension
        return resolvePath(CLIENT_MODULE_ID, import.meta.url).replace(/\.js$/, '.mjs');
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
          // 传递插件配置 | Pass plugin configuration
          ...options,
          // 标准化根目录 | Normalized root directory
          rootDir,
          // 注入服务器端口 | Inject server port
          port: serverPort,
        });
      }
    },
  };
}
