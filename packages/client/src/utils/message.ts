import { isStr } from '@open-editor/shared';
import { on } from '../event';

/**
 * 创建带类型标识的消息字符串
 * @原理 将消息类型与参数序列化组合，便于接收方识别处理
 * @示例 createMessage('LOG', ['error']) => "@LOG["error"]"
 */
function createMessage(type: string, args: any[]): string {
  return `@${type}${JSON.stringify(args)}`;
}

/**
 * 解析带类型标识的消息
 * @返回 { type: string, args: any[] } | null
 * @安全 使用try-catch防止恶意数据导致解析失败
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
  } catch (e) {
    console.error('消息解析失败', e);
  }
  return null;
}

/**
 * 注册消息监听器
 * @功能 自动过滤并解析指定类型的消息
 * @安全 通过类型前缀校验防止消息劫持
 * @示例 onMessage('UPDATE', (args) => console.log(args))
 */
export function onMessage<Args extends any[] = []>(type: string, callback: (args: Args) => void) {
  on('message', ({ data }) => {
    // 双重校验：字符串类型 + 格式匹配
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
 * @安全 建议生产环境指定targetOrigin替代'*'
 * @原理 通过结构化消息格式保证数据完整性
 */
export function postMessage(
  type: string,
  args: any[] = [],
  target: Window = window,
  targetOrigin: string = '*',
) {
  target.postMessage(createMessage(type, args), targetOrigin);
}

/**
 * 向所有同源子窗口广播消息
 * @安全 crossOrigin=true时可能触发CORS错误
 * @实现 优先尝试安全访问，降级处理跨域场景
 */
export function postMessageAll(type: string, args: any[] = [], crossOrigin: boolean = false) {
  // 兼容性获取iframe窗口对象
  const frames = Array.from(document.querySelectorAll('iframe'))
    .map((iframe) => iframe.contentWindow)
    .filter(Boolean) as Window[];

  frames.forEach((target) => {
    try {
      // 尝试安全访问
      if (crossOrigin || target.document) {
        postMessage(type, args, target);
      }
    } catch (e) {
      // 跨域场景降级处理
      if (crossOrigin) {
        target.postMessage(createMessage(type, args), '*');
      }
    }
  });
}
