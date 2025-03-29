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
 * 插件配置选项
 */
export interface Options {
  /**
   * 源码根目录路径
   *
   * @默认值 process.cwd()
   */
  rootDir?: string;

  /**
   * 在浏览器中显示调试开关
   *
   * @默认值 true
   */
  displayToggle?: boolean;

  /**
   * 禁用启用检查器时的CSS悬停效果
   *
   * @默认值 true
   */
  disableHoverCSS?: boolean;

  /**
   * 忽略指定目录的组件（使用glob模式语法匹配）
   *
   * @默认值 '\/**\/node_modules\/**\/*'
   *
   * @参考 https://en.wikipedia.org/wiki/Glob_(programming)
   */
  ignoreComponents?: string | string[];

  /**
   * 打开编辑器或组件树后退出检查
   *
   * @默认值 true
   */
  once?: boolean;

  /**
   * 启用跨iframe交互（仅在顶层窗口和iframe窗口同源时生效）
   *
   * @默认值 true
   */
  crossIframe?: boolean;

  /**
   * 内部服务器配置
   */
  server?: {
    /**
     * 启用HTTPS配置
     *
     * @参考 https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options
     */
    https?: {
      key: string;
      cert: string;
    };
  };

  /**
   * 自定义编辑器打开处理器
   *
   * @默认值 'launch-editor'
   */
  onOpenEditor?(file: string): void;
}

const resolvePath = (path: string) => _resolvePath(path, import.meta.url);

const PLUGIN_NAME = 'OpenEditorPlugin';
const LOADER_PATH = resolvePath('./transform');

// 端口号缓存对象（键：配置缓存键，值：端口号Promise）
const portPromiseCache: Record<string, Promise<number>> = {};

/**
 * 开发环境专用的Webpack插件
 *
 * @说明 该插件用于在开发环境下提供组件调试能力，
 *       自动注入调试客户端并启动调试服务器
 */
export default class OpenEditorPlugin {
  private options: Options & { port?: number };

  constructor(options: Options = {}) {
    // 初始化配置参数
    this.options = {
      rootDir: normalizePath(options.rootDir ?? process.cwd()),
      ...options,
    };
  }

  /**
   * Webpack插件入口方法
   *
   * @流程说明
   * 1. 配置模块解析规则
   * 2. 设置客户端模块别名
   * 3. 启动调试服务器
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

      // 配置客户端模块别名
      compiler.options.resolve.alias ||= {};
      compiler.options.resolve.alias[CLIENT_MODULE_ID] = resolvePath(CLIENT_MODULE_ID);
    });

    // 编译开始时启动调试服务器
    compiler.hooks.make.tapPromise(PLUGIN_NAME, async () => {
      await this.startDebugServer();
    });
  }

  /**
   * 处理加载器配置
   */
  private handleLoaderConfiguration(data: any) {
    const { resource, compiler } = data;

    // 仅处理客户端编译
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
   * 启动调试服务器
   */
  private async startDebugServer() {
    // 生成配置缓存键
    const cacheKey = `${this.options.rootDir}${this.options.onOpenEditor}`;

    // 重用或创建新的服务器实例
    this.options.port = await (portPromiseCache[cacheKey] ||= setupServer({
      ...this.options,
      ...(this.options.server ?? {}),
    }));
  }
}
