import type { Compiler as WebpackCompiler } from 'webpack';
import {
  CLIENT_MODULE_ID,
  ENTRY_ESM_MATCH_RE,
  ENTRY_MATCH_RE,
  normalizePath,
} from '@open-editor/shared';
import { isDev, resolvePath as _resolvePath } from '@open-editor/shared/node';
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

const resolvePath = (path: string) => _resolvePath(path, import.meta.url);

// 插件名称 | Plugin name
const PLUGIN_NAME = 'OpenEditorPlugin';
/** 加载器路径 (通过 resolvePath 解析) | Loader path (resolved via resolvePath) */
const LOADER_PATH = resolvePath('./transform');

/** 端口号缓存对象 (键: 配置缓存键, 值: 端口号Promise) | Port cache (key: config cache key, value: port Promise) */
const portPromiseCache: Record<string, Promise<number>> = {};

/**
 * 开发环境下启用组件源码定位功能 | Enable component source code location in development
 */
export default class OpenEditorPlugin {
  /** @internal */
  private options: Options & { port?: number };
  /** @internal */
  private NODE_MODULES_RE = /\/node_modules\//;

  /**
   * 构造函数 | Constructor
   * @param options 插件配置选项 | Plugin configuration options
   */
  constructor(options: Options = {}) {
    // 初始化配置参数 | Initialize configuration parameters
    this.options = {
      rootDir: normalizePath(options.rootDir ?? process.cwd()),
      ...options,
    };
  }

  /**
   * 插件入口方法，兼容 Webpack 与 Rspack
   * @param compiler Webpack.Compiler 或 Rspack.Compiler 实例
   */
  apply(compiler: WebpackCompiler) {
    if (!isDev()) return;

    // 环境准备完成后配置模块规则 | Configure module rules after environment setup
    compiler.hooks.afterEnvironment.tap(PLUGIN_NAME, () => {
      compiler.options.module.rules.push({
        include: (id) => this.NODE_MODULES_RE.test(id) && ENTRY_MATCH_RE.test(id),
        use: (data) => ({
          options: {
            ...this.options,
            isCommonjs: !ENTRY_ESM_MATCH_RE.test(data.resource!),
          },
          loader: LOADER_PATH,
        }),
        type: 'javascript/auto',
      });

      const resolve = compiler.options.resolve;
      const clientPath = resolvePath(CLIENT_MODULE_ID);
      if (Array.isArray(resolve.alias)) {
        resolve.alias.push({
          name: CLIENT_MODULE_ID,
          alias: clientPath,
          onlyModule: true,
        });
      } else {
        resolve.alias ||= {};
        resolve.alias[CLIENT_MODULE_ID] = clientPath;
      }
    });

    // 编译开始时启动调试服务器 | Start debug server when compilation begins
    compiler.hooks.make.tapPromise(PLUGIN_NAME, async () => {
      // 生成配置缓存键 | Generate config cache key
      const cacheKey = `${this.options.rootDir}${this.options.onOpenEditor}`;
      // 重用或创建新的服务器实例 | Reuse or create new server instance
      this.options.port = await (portPromiseCache[cacheKey] ||=
        // 启动调试服务器 | Start debug server
        setupServer({
          ...this.options,
          ...(this.options.server ?? {}),
        }));
    });
  }
}
