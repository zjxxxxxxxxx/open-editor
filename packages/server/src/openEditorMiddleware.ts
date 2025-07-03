import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'node:url';
import { type ServerResponse } from 'node:http';
import connect from 'connect';
import openEditor from 'launch-editor';

const DEFAULE_OPEN_DDITOR = (file: string, errorCallback: (errorMessage: string) => void) => {
  openEditor(file, (_, errorMessage) => errorCallback(errorMessage));
};

export interface OpenEditorMiddlewareOptions {
  /**
   * 项目根目录路径
   *
   * @default process.cwd()
   *
   * @remarks
   * 用于解析文件相对路径的基础目录
   */
  rootDir?: string;

  /**
   * 自定义编辑器打开处理器
   *
   * @remarks
   * 默认使用 launch-editor 库实现
   * 可通过此参数覆盖默认行为
   */
  onOpenEditor?(file: string, errorCallback: (errorMessage: string) => void): void;
}

/**
 * 创建编辑器中间件
 *
 * @param options - 中间件配置选项
 * @returns connect 中间件处理函数
 */
export function openEditorMiddleware(
  options: OpenEditorMiddlewareOptions = {},
): connect.NextHandleFunction {
  const { rootDir = process.cwd(), onOpenEditor = DEFAULE_OPEN_DDITOR } = options;

  return (req, res) => {
    try {
      // 解析请求参数
      const { query } = parse(req.url ?? '/', true);
      const {
        f: file = 'unknown',
        l: line = '1',
        c: column = '1',
      } = query as Record<string, string>;

      // 验证必要参数
      if (!file) {
        sendErrorResponse(res, 400, '缺少文件路径参数');
        return;
      }

      // 处理文件路径
      const filename = resolve(rootDir, decodeURIComponent(file));

      // 验证文件有效性
      if (!validateFile(filename, res)) return;

      // 触发编辑器打开
      if (req.headers.referer) {
        onOpenEditor(`${filename}:${line}:${column}`, (errorMessage) => {
          throw new Error(errorMessage || '可能原因有编辑器未启动/编辑器未响应');
        });
      }

      // 返回文件内容
      sendFileContent(res, filename);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      sendErrorResponse(res, 500, `服务器内部错误: ${errorMessage}`);
    }
  };
}

/**
 * 验证文件有效性
 */
function validateFile(filename: string, res: ServerResponse): boolean {
  if (!existsSync(filename)) {
    sendErrorResponse(res, 404, `文件 '${filename}' 不存在`);
    return false;
  }
  if (!statSync(filename).isFile()) {
    sendErrorResponse(res, 400, `'${filename}' 不是有效文件`);
    return false;
  }
  return true;
}

/**
 * 发送文件内容响应
 */
function sendFileContent(res: ServerResponse, filename: string): void {
  res.setHeader('Content-Type', 'application/javascript;charset=UTF-8');
  res.end(readFileSync(filename, 'utf-8'));
}

/**
 * 统一错误响应处理
 */
function sendErrorResponse(res: ServerResponse, code: number, message: string): void {
  res.statusCode = code;
  res.setHeader('Content-Type', 'text/plain;charset=UTF-8');
  res.end(`[@open-editor/server] ${message}`);
}
