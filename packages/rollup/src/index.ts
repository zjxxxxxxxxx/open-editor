import { resolve } from 'node:path';
import { type Plugin } from 'rollup';
import { isDev, resolvePath } from '@open-editor/shared/node';
import { CLIENT_MODULE_ID, ENTRY_MATCH_RE, injectClient, normalizePath } from '@open-editor/shared';
import { setupServer } from '@open-editor/server';

/**
 * 插件配置选项
 */
export interface Options {
  /**
   * 源码根目录路径
   * @default process.cwd()
   */
  rootDir?: string;

  /**
   * 在浏览器中显示调试开关
   * @default true
   */
  displayToggle?: boolean;

  /**
   * 禁用调试模式下的CSS悬停效果
   * @default true
   */
  disableHoverCSS?: boolean;

  /**
   * 需要忽略的组件目录匹配规则
   * @see https://en.wikipedia.org/wiki/Glob_(programming)
   * @default '\/**\/node_modules\/**\/*'
   */
  ignoreComponents?: string | string[];

  /**
   * 打开编辑器后是否自动退出检查
   * @default true
   */
  once?: boolean;

  /**
   * 允许跨iframe窗口交互提升到顶层窗口
   * @remarks 仅在同源环境下生效
   * @default true
   */
  crossIframe?: boolean;

  /**
   * 服务端配置
   */
  server?: {
    /**
     * 启用HTTPS配置
     * @see https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options
     */
    https?: {
      key: string;
      cert: string;
    };
  };

  /**
   * 自定义编辑器打开处理器
   * @default 'launch-editor'
   */
  onOpenEditor?(file: string): void;
}

/**
 * 开发环境端口缓存池
 */
const portPromiseCache: Record<string, Promise<number>> = {};

/**
 * 开发环境专用编辑器调试插件
 * @remarks 仅在开发模式下生效
 */
export default function OpenEditorPlugin(options: Options = {}): Plugin | undefined {
  // 非开发环境返回空插件
  if (!isDev()) {
    return { name: 'OpenEditorPlugin' };
  }

  const { onOpenEditor } = options;
  const rootDir = normalizePath(options.rootDir ? resolve(options.rootDir) : process.cwd());

  let serverPort: number;

  return {
    name: 'OpenEditorPlugin',

    /**
     * 构建启动阶段初始化服务
     */
    async buildStart() {
      const cacheKey = `${rootDir}${onOpenEditor}`;
      serverPort = await (portPromiseCache[cacheKey] ||= setupServer({
        ...(options.server ?? {}),
        rootDir,
        onOpenEditor,
      }));
    },

    /**
     * 解析客户端模块ID
     */
    resolveId(id: string) {
      if (id === CLIENT_MODULE_ID) {
        return resolvePath(CLIENT_MODULE_ID, import.meta.url).replace(/\.js$/, '.mjs');
      }
    },

    /**
     * 转换入口文件注入客户端代码
     */
    transform(code: string, id: string) {
      if (ENTRY_MATCH_RE.test(id)) {
        return injectClient(code, {
          ...options,
          rootDir,
          port: serverPort,
        });
      }
    },
  };
}
