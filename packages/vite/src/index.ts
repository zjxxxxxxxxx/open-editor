import { resolve } from 'node:path';
import { type ViteDevServer } from 'vite';
import { CLIENT_MODULE_ID, ServerApis, injectClient, normalizePath } from '@open-editor/shared';
import { isDev, resolvePath } from '@open-editor/shared/node';
import { openEditorMiddleware } from '@open-editor/server';

/**
 * 插件配置选项
 */
export interface Options {
  /**
   * 源代码根目录路径
   *
   * @default process.cwd()
   */
  rootDir?: string;

  /**
   * 是否在浏览器显示切换按钮
   *
   * @default true
   */
  displayToggle?: boolean;

  /**
   * 禁用启用检查器时的CSS悬停效果
   *
   * @default true
   */
  disableHoverCSS?: boolean;

  /**
   * 忽略指定目录的组件（使用glob模式匹配）
   *
   * @see https://en.wikipedia.org/wiki/Glob_(programming)
   * @default '\/**\/node_modules\/**\/*'
   */
  ignoreComponents?: string | string[];

  /**
   * 打开编辑器或组件树后是否退出检查
   *
   * @default true
   */
  once?: boolean;

  /**
   * 启用跨iframe交互提升到顶层窗口
   * （仅在同源情况下生效）
   *
   * @default true
   */
  crossIframe?: boolean;

  /**
   * 自定义编辑器打开处理器
   *
   * @default 使用内置的launch-editor实现
   */
  onOpenEditor?(file: string): void;
}

const CLIENT_ID = '/client.mjs'; // 客户端模块虚拟路径

/**
 * Vite插件：开发环境下启用组件源码定位功能
 *
 * @param options 插件配置选项
 * @returns Vite插件对象
 */
export default function OpenEditorPlugin(options: Options = {}) {
  // 非开发环境返回空插件
  if (!isDev()) {
    return { name: 'OpenEditorPlugin' };
  }

  // 配置处理
  const { onOpenEditor } = options;
  const rootDir = normalizePath(options.rootDir ? resolve(options.rootDir) : process.cwd());

  return {
    name: 'OpenEditorPlugin',
    apply: <const>'serve', // 仅开发环境生效

    // 开发服务器配置
    configureServer(server: Pick<ViteDevServer, 'middlewares'>) {
      // 注册中间件处理编辑器打开请求
      server.middlewares.use(
        ServerApis.OPEN_EDITOR, // 打开编辑器API路径
        openEditorMiddleware({
          // 中间件配置
          rootDir,
          onOpenEditor,
        }),
      );
    },

    // 模块解析逻辑
    resolveId(id) {
      if (id === CLIENT_MODULE_ID) {
        // 解析客户端模块实际路径（.mjs扩展名处理）
        return resolvePath(CLIENT_MODULE_ID, import.meta.url).replace(/\.js$/, '.mjs');
      }
    },

    // 代码转换逻辑
    transform(code: string, id: string) {
      if (id.endsWith(CLIENT_ID)) {
        // 向客户端代码注入配置参数
        return injectClient(code, {
          ...options,
          rootDir,
        });
      }
    },
  };
}
