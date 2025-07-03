import { isStr } from '@open-editor/shared/type';
import { on } from '../event';

/**
 * 创建带类型标识的消息字符串
 *
 * @example createMessage('LOG', ['error']) => "@LOG["error"]"
 */
function createMessage(type: string, args: any[]) {
  return `@${type}${JSON.stringify(args)}`;
}

/**
 * 解析带类型标识的消息
 * @returns { type: string, args: any[] } | null
 */
function parseMessage(data: string) {
  try {
    if (data.startsWith('@') && data.includes('[')) {
      const typeEnd = data.indexOf('[');
      return {
        type: data.substring(1, typeEnd),
        args: JSON.parse(data.substring(typeEnd)),
      };
    }
  } catch {
    //
  }
  return null;
}

/**
 * 注册消息监听器
 *
 * @example onMessage('UPDATE', (args) => console.log(args))
 */
export function onMessage<Args extends any[] = []>(type: string, callback: (args: Args) => void) {
  on('message', ({ data }) => {
    if (isStr(data)) {
      const msg = parseMessage(data);
      if (msg?.type === type) {
        callback(msg.args as Args);
      }
    }
  });
}

/**
 * 发送消息到指定窗口
 */
export function postMessage(type: string, args: any[] = [], target: Window = window) {
  target.postMessage(createMessage(type, args), '*');
}

/**
 * 向所有同源子窗口广播消息
 */
export function postMessageAll(type: string, args: any[] = [], crossOrigin: boolean = false) {
  // 兼容性获取 iframe 窗口对象
  const frames = Array.from(document.querySelectorAll('iframe'))
    .map((iframe) => iframe.contentWindow)
    .filter(Boolean) as Window[];

  frames.forEach((target) => {
    try {
      // 尝试安全访问
      if (crossOrigin || target.document) {
        postMessage(type, args, target);
      }
    } catch {
      // 跨越容错处理
      if (crossOrigin) {
        postMessage(type, args, target);
      }
    }
  });
}
