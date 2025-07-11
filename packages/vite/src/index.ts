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
   * 自定义编辑器打开处理器 | Custom editor opening handler
   * @default `launch-editor`
   * @remarks
   * 覆盖默认的文件打开逻辑 | Override default file opening behavior
   */
  onOpenEditor?(file: string, errorCallback: (errorMessage: string) => void): void;
}

// 插件名称 | Plugin name
const PLUGIN_NAME = 'OpenEditorPlugin';

const CLIENT_ID = '/client.mjs'; // 客户端模块虚拟路径 | Client module virtual path

/**
 * 开发环境下启用组件源码定位功能 | Enable component source code location in development
 */
export default function OpenEditorPlugin(options: Options = {}) {
  // 非开发环境返回空插件 | Return empty plugin in non-dev environments
  if (!isDev()) return { name: PLUGIN_NAME };

  // 配置标准化处理 | Configuration normalization
  const { onOpenEditor } = options;
  const rootDir = normalizePath(options.rootDir ? resolve(options.rootDir) : process.cwd());

  return {
    name: PLUGIN_NAME,
    // 仅开发环境生效 | Activate only in dev mode
    apply: <const>'serve',

    /**
     * 开发服务器配置 | Dev server configuration
     */
    configureServer(server: Pick<ViteDevServer, 'middlewares'>) {
      server.middlewares.use(
        // API 端点路径 | API endpoint path
        ServerApis.OPEN_EDITOR,
        openEditorMiddleware({
          // 项目根目录 | Project root directory
          rootDir,
          // 自定义打开处理器 | Custom opening handler
          onOpenEditor,
        }),
      );
    },

    /**
     * 模块解析逻辑 | Module resolution logic
     */
    resolveId(id: string) {
      if (id === CLIENT_MODULE_ID) {
        // 确保 ES 模块兼容性 | Ensure ES module compatibility
        return resolvePath(CLIENT_MODULE_ID, import.meta.url).replace(/\.js$/, '.mjs');
      }
    },

    /**
     * 代码转换逻辑 | Code transformation
     */
    transform(code: string, id: string) {
      if (id.endsWith(CLIENT_ID)) {
        return injectClient(code, {
          // 用户配置 | User options
          ...options,
          // 处理后的根目录 | Processed root directory
          rootDir,
        });
      }
    },
  };
}
