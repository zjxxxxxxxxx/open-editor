import { ServerApis } from '@open-editor/shared';
import { logError } from '../utils/logError';
import { dispatchEvent } from '../utils/dispatchEvent';
import { openEditorEndBridge, openEditorErrorBridge, openEditorStartBridge } from '../bridge';
import { type CodeSourceMeta } from '../resolve';
import { getOptions } from '../options';
import { OPEN_EDITOR_EVENT } from '../constants';

/**
 * 启动编辑器并处理相关生命周期事件
 * @param meta 源码元信息，包含文件路径、行列号等信息
 */
export async function openEditor(meta?: CodeSourceMeta) {
  // 生成编辑器打开URL并触发前置事件
  const openURL = createOpenURL(meta);
  if (!dispatchEvent(OPEN_EDITOR_EVENT, openURL)) return;

  // 元数据校验守卫语句
  if (!meta) {
    return handleOpenError([], '文件未找到');
  }

  try {
    // 通知编辑器启动事件
    openEditorStartBridge.emit();

    // 发起打开编辑器请求
    const response = await fetch(openURL);
    if (!response.ok) {
      throw new Error(`HTTP错误状态: ${response.status}`);
    }
  } catch (err) {
    // 错误处理（包含网络错误和业务错误）
    const { file, line = 1, column = 1 } = meta;
    return handleOpenError(err, `${file}:${line}:${column} 打开失败`);
  } finally {
    // 确保最终触发结束事件
    openEditorEndBridge.emit();
  }
}

/**
 * 生成编辑器打开的请求URL
 * @param meta 源码元信息
 * @returns 完整构造的URL对象
 */
export function createOpenURL(meta?: CodeSourceMeta) {
  const opts = getOptions();
  const { protocol, hostname, port } = location;
  const { file = '', line = 1, column = 1 } = meta ?? {};

  // 构造基础URL
  const openURL = new URL(`${protocol}//${hostname}`);
  openURL.pathname = ServerApis.OPEN_EDITOR;

  // 处理端口配置（优先使用配置项中的端口）
  openURL.port = opts.port || port;

  // 设置查询参数并编码处理
  openURL.searchParams.set('f', encodeURIComponent(file));
  openURL.searchParams.set('l', String(line));
  openURL.searchParams.set('c', String(column));

  return openURL;
}

/**
 * 统一错误处理函数
 * @param error 原始错误对象
 * @param message 自定义错误信息
 */
function handleOpenError(error: unknown, message: string) {
  logError(message);
  openEditorErrorBridge.emit();
  return Promise.reject(error);
}
