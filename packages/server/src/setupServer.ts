import http from 'node:http';
import https from 'node:https';
import { readFileSync } from 'node:fs';
import { createApp } from './createApp';
import { getAvailablePort } from './getAvailablePort';

/**
 * 服务器核心配置选项
 * @remarks
 * 本配置定义了服务器启动的基础参数，支持HTTP/HTTPS双协议模式，
 * 证书配置遵循TLS标准规范，适用于本地开发和生产环境
 */
export interface Options {
  /**
   * 项目源码根目录路径
   * @defaultValue `process.cwd()` 进程当前工作目录
   * @securityNote 需确保该路径具备可读权限
   */
  rootDir?: string;

  /**
   * HTTPS安全传输层配置
   * @see [TLS Context Options](https://nodejs.org/api/tls.html#tlscreatesecurecontextoptions)
   * @example
   * {
   *   key: '/path/to/private.key',
   *   cert: '/path/to/certificate.pem'
   * }
   */
  https?: {
    /**
     * PEM格式的SSL私钥文件路径
     * @fileMustExist 文件必须存在且可读
     */
    key: string;
    /**
     * PEM格式的SSL证书文件路径
     * @fileMustExist 文件必须存在且可读
     */
    cert: string;
  };

  /**
   * 自定义编辑器打开处理器
   * @defaultValue 使用内置的`launch-editor`实现
   * @param file - 需要打开的目标文件路径
   */
  onOpenEditor?(file: string): void;
}

/**
 * 创建并启动应用服务器
 * @param options - 服务器配置参数集
 * @returns 返回包含实际监听端口的Promise
 *
 * @technicalProcess
 * 1. 初始化应用实例
 * 2. 根据配置创建HTTP/HTTPS服务器
 * 3. 动态分配可用端口并启动监听
 *
 * @example
 * ```typescript
 * setupServer({
 *   https: {
 *     key: 'key.pem',
 *     cert: 'cert.pem'
 *   }
 * }).then(port => {
 *   console.log(`Server running on port ${port}`);
 * });
 * ```
 */
export function setupServer(options: Options = {}) {
  const { rootDir, https: httpsConfig } = options;

  // 初始化基础应用实例(含路由和中间件)
  const app = createApp({ rootDir });

  // 根据安全配置创建服务器实例
  const server = createHttpServer(app, httpsConfig);

  return startServer(server);
}

/**
 * 创建HTTP/HTTPS服务器实例
 * @param app - 已配置的Express应用实例
 * @param httpsConfig - TLS安全配置参数
 * @returns 返回HTTP或HTTPS服务器实例
 */
function createHttpServer(app: ReturnType<typeof createApp>, httpsConfig?: Options['https']) {
  // HTTP基础模式
  if (!httpsConfig) {
    return http.createServer(app);
  }

  // 加载SSL证书文件
  const sslOptions = {
    key: readFileSync(httpsConfig.key), // 同步读取确保启动顺序
    cert: readFileSync(httpsConfig.cert),
  };

  return https.createServer(sslOptions, app);
}

/**
 * 启动服务器并动态分配端口
 * @param server - 已创建的服务器实例
 * @returns 返回实际监听端口的Promise
 */
function startServer(server: http.Server) {
  return new Promise<number>((resolve, reject) => {
    getAvailablePort()
      .then((port) => {
        server
          .listen(port)
          .once('listening', () => resolve(port))
          .once('error', reject);
      })
      .catch(reject);
  });
}
