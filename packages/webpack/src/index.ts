import type webpack from 'webpack';
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

const resolvePath = (path: string) => _resolvePath(path, import.meta.url);

/** 插件名称常量 | Plugin name constant */
const PLUGIN_NAME = 'OpenEditorPlugin';
/** 加载器路径 (通过resolvePath解析) | Loader path (resolved via resolvePath) */
const LOADER_PATH = resolvePath('./transform');

/** 端口号缓存对象 (键: 配置缓存键, 值: 端口号Promise) | Port cache (key: config cache key, value: port Promise) */
const portPromiseCache: Record<string, Promise<number>> = {};

/**
 * 开发环境专用的Webpack插件 | Webpack plugin dedicated for development environment
 *
 * @说明 该插件用于在开发环境下提供组件调试能力，自动注入调试客户端并启动调试服务器
 * @description Provides component debugging capabilities in dev environment,
 *              auto-injects debug client and starts debug server
 */
export default class OpenEditorPlugin {
  /**
   * @internal
   */
  private options: Options & { port?: number };

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
   * Webpack插件入口方法 | Webpack plugin entry method
   *
   * @流程说明 | Workflow:
   * 1. 配置模块解析规则 | Configure module resolution rules
   * 2. 设置客户端模块别名 | Set client module alias
   * 3. 启动调试服务器 | Start debug server
   *
   * @param compiler Webpack编译器实例 | Webpack compiler instance
   */
  apply(compiler: webpack.Compiler) {
    if (!isDev()) return;

    // 环境准备完成后配置模块规则
    compiler.hooks.afterEnvironment.tap(PLUGIN_NAME, () => {
      compiler.options.module.rules.push({
        test: /[\\/]node_modules[\\/]/,
        include: ENTRY_MATCH_RE,
        use: (data: any) => this.handleLoaderConfiguration(data),
      });

      // 配置客户端模块别名 | Configure client module alias
      compiler.options.resolve.alias ||= {};
      compiler.options.resolve.alias[CLIENT_MODULE_ID] = resolvePath(CLIENT_MODULE_ID);
    });

    // 编译开始时启动调试服务器 | Start debug server when compilation begins
    compiler.hooks.make.tapPromise(PLUGIN_NAME, async () => {
      await this.startDebugServer();
    });
  }

  /**
   * 处理加载器配置 | Handle loader configuration
   *
   * @internal
   *
   * @param data 加载器配置数据 | Loader configuration data
   * @returns 处理后的加载器配置 | Processed loader configuration
   */
  private handleLoaderConfiguration(data: any) {
    const { resource, compiler } = data;

    // 仅处理客户端编译 | Only process client compilation
    if (!compiler || compiler === 'client') {
      return {
        options: {
          ...this.options,
          isCommonjs: !ENTRY_ESM_MATCH_RE.test(resource),
        },
        loader: LOADER_PATH,
      };
    }

    return [];
  }

  /**
   * 启动调试服务器 | Start debug server
   *
   * @internal
   */
  private async startDebugServer() {
    // 生成配置缓存键 | Generate config cache key
    const cacheKey = `${this.options.rootDir}${this.options.onOpenEditor}`;

    // 重用或创建新的服务器实例 | Reuse or create new server instance
    this.options.port = await (portPromiseCache[cacheKey] ||= setupServer({
      ...this.options,
      ...(this.options.server ?? {}),
    }));
  }
}
