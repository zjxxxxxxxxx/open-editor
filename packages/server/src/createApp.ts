import connect from 'connect';
import corsMiddleware from 'cors';
import { ServerApis } from '@open-editor/shared';
import { openEditorMiddleware } from './openEditorMiddleware';

/**
 * 应用配置选项接口
 */
interface CreateAppOptions {
  /**
   * 项目根目录路径
   * - 用于解析相对路径文件
   * - 当不指定时会默认使用进程工作目录
   */
  rootDir?: string;

  /**
   * 编辑器打开回调函数
   * - 接收文件绝对路径作为参数
   * - 可用于自定义编辑器打开逻辑
   */
  onOpenEditor?(file: string, errorCallback: (errorMessage: string) => void): void;
}

/**
 * 创建中间件应用
 * @param options 应用配置选项
 * @returns 配置完成的 Connect 应用实例
 */
export function createApp(options: CreateAppOptions) {
  const { rootDir, onOpenEditor } = options;
  const app = connect();

  // 配置跨域中间件
  app.use(
    corsMiddleware({
      // 仅允许 GET 方法请求
      methods: 'GET',
    }),
  );

  // 挂载编辑器打开路由
  app.use(
    // API 路径常量
    ServerApis.OPEN_EDITOR,
    openEditorMiddleware({
      // 传递根目录配置
      rootDir,
      // 传递回调函数
      onOpenEditor,
    }),
  );

  return app;
}
