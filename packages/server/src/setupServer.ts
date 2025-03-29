import http from 'node:http';
import https from 'node:https';
import { readFileSync } from 'node:fs';
import { createApp } from './createApp';

/**
 * 服务器配置选项
 */
export interface Options {
  /**
   * 源码根目录路径
   * @default process.cwd()
   */
  rootDir?: string;

  /**
   * 启用HTTPS配置
   * @see https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options
   */
  https?: {
    /**
     * SSL私钥文件路径
     */
    key: string;
    /**
     * SSL证书文件路径
     */
    cert: string;
  };

  /**
   * 自定义编辑器打开处理器
   * @default 'launch-editor'
   */
  onOpenEditor?(file: string): void;
}

/**
 * 创建并启动服务器
 * @param options 服务器配置选项
 * @returns 包含端口号的Promise
 */
export function setupServer(options: Options = {}) {
  const { rootDir, https: httpsConfig } = options;

  // 创建基础应用实例
  const app = createApp({ rootDir });

  // 根据配置创建HTTP/HTTPS服务器
  const server = createHttpServer(app, httpsConfig);

  return startServerWithPromise(server);
}

/**
 * 创建HTTP/HTTPS服务器实例
 */
function createHttpServer(app: ReturnType<typeof createApp>, httpsConfig?: Options['https']) {
  if (!httpsConfig) {
    return http.createServer(app);
  }

  // 读取SSL证书文件
  const sslOptions = {
    key: readFileSync(httpsConfig.key),
    cert: readFileSync(httpsConfig.cert),
  };

  return https.createServer(sslOptions, app);
}

/**
 * 启动服务器并返回端口Promise
 */
function startServerWithPromise(server: http.Server) {
  return new Promise<number>((resolve, reject) => {
    // 统一错误处理
    const handleError = (err: Error) => {
      server.close();
      reject(err);
    };

    server
      .once('listening', () => {
        const address = server.address();

        // 地址解析异常处理
        if (!address) {
          handleError(new Error('服务器地址解析失败'));
          return;
        }

        // 获取实际监听端口
        const port = typeof address === 'string' ? parsePortFromAddress(address) : address.port;

        resolve(port);
      })
      .once('error', handleError);
  });
}

/**
 * 从地址字符串解析端口号
 */
function parsePortFromAddress(address: string): number {
  const portMatch = address.match(/:(\d+)$/);
  if (!portMatch?.[1]) {
    throw new Error(`无效的地址格式: ${address}`);
  }
  return parseInt(portMatch[1], 10);
}
