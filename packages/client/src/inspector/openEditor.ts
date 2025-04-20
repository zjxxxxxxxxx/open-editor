import { ServerApis } from '@open-editor/shared';
import { logError } from '../utils/logError';
import { dispatchEvent } from '../utils/dispatchEvent';
import { openEditorEndBridge, openEditorErrorBridge, openEditorStartBridge } from '../bridge';
import { type CodeSourceMeta } from '../resolve';
import { getOptions } from '../options';
import { OPEN_EDITOR_EVENT } from '../constants';

/**
 * 启动编辑器并处理相关生命周期事件
 *
 * @param meta 源码元信息，包含文件路径、行列号等信息
 */
export async function openEditor(meta?: CodeSourceMeta) {
  // 构造编辑器打开 URL 并触发打开前事件
  const editorURL = generateEditorURL(meta);
  if (!dispatchEvent(OPEN_EDITOR_EVENT, editorURL)) return;

  // 若未提供源码元信息，则立即触发错误处理
  if (!meta) {
    return triggerEditorLaunchError([], '文件未找到');
  }

  try {
    // 通知编辑器启动开始
    openEditorStartBridge.emit();

    // 发起打开编辑器请求
    const response = await fetch(editorURL);
    if (!response.ok) {
      throw new Error(`HTTP 错误状态: ${response.status}`);
    }
  } catch (error) {
    const { file, line = 1, column = 1 } = meta;
    return triggerEditorLaunchError(error, `${file}:${line}:${column} 打开失败`);
  } finally {
    // 确保不论成功与否均触发结束事件
    openEditorEndBridge.emit();
  }
}

/**
 * 构造编辑器请求的 URL
 *
 * @param meta 源码元信息
 * @returns 完整的编辑器 URL 对象
 */
export function generateEditorURL(meta?: CodeSourceMeta): URL {
  const opts = getOptions();
  const { protocol, hostname, port } = window.location;
  const { file = '', line = 1, column = 1 } = meta ?? {};

  // 构造基础 URL
  const editorURL = new URL(`${protocol}//${hostname}`);
  editorURL.pathname = ServerApis.OPEN_EDITOR;

  // 处理端口：优先使用配置项中指定的端口
  editorURL.port = opts.port || port;

  // 设置查询参数（注意编码文件路径）
  editorURL.searchParams.set('f', encodeURIComponent(file));
  editorURL.searchParams.set('l', String(line));
  editorURL.searchParams.set('c', String(column));

  return editorURL;
}

/**
 * 统一处理编辑器启动错误：
 * 记录错误日志、触发错误事件，并返回一个拒绝的 Promise。
 *
 * @param error 原始错误对象（或错误信息）
 * @param message 自定义错误消息
 * @returns 返回一个拒绝的 Promise
 */
function triggerEditorLaunchError(error: unknown, message: string): Promise<never> {
  logError(message);
  openEditorErrorBridge.emit([message]);
  return Promise.reject(error);
}
