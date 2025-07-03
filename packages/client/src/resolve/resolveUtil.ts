import { normalizePath } from '@open-editor/shared';
import { type DSValue } from '@open-editor/shared/debugSource';
import outmatch from 'outmatch';
import { getOptions } from '../options';

/**
 * 安全路径生成（防止路径遍历攻击）
 *
 * @example
 * ensureFileName('/project/src/../../secret.txt') => 'secret.txt'
 */
export function ensureFileName(filePath: string) {
  const { rootDir } = getOptions();
  const normalizedPath = normalizePath(filePath);

  // 移除根目录前缀（使用字符串操作代替 Node.js 路径 API）
  if (normalizedPath.startsWith(rootDir)) {
    return (
      normalizedPath
        .replace(rootDir, '')
        // 移除前缀斜杠
        .replace(/^\/+/g, '')
        // 合并多余斜杠
        .replace(/\/{2,}/g, '/')
    );
  }

  // 防御相对路径攻击（参考 Path Manipulation 漏洞处理）
  return (
    normalizedPath
      // 移除父目录标识
      .replace(/\.\.\//g, '')
      .replace(/\/+/g, '/')
  );
}

// 系统级黑名单路径（参考 CI 环境路径限制）
const SYSTEM_BLACKLIST = /^(\/home\/runner|\/tmp\/build)/;
/**
 * 文件名安全校验（满足双重校验原则）
 * 1. 防止系统敏感路径访问
 * 2. 过滤项目配置的 glob 模式
 */
export function isValidFileName(filePath?: string | null): filePath is string {
  if (!filePath) return false;

  // 双重安全校验（黑名单 + 项目规则）
  return !SYSTEM_BLACKLIST.test(filePath) && applyProjectIgnoreRules(filePath);
}

/**
 * 项目级忽略规则处理器，结合 glob 模式和白名单字符校验
 */
let globMatcher: ReturnType<typeof outmatch> | null = null;
function applyProjectIgnoreRules(path: string) {
  // 基础字符白名单校验
  if (!SAFE_CHAR_RE.test(path) || !hasValidBrackets(path)) return false;

  const { ignoreComponents } = getOptions();

  // 空配置默认放行
  if (!ignoreComponents) return true;

  // 惰性初始化 glob 匹配器（配置浏览器环境参数）
  globMatcher ||= outmatch(ignoreComponents, {
    separator: '/',
    excludeDot: false,
  });
  return !globMatcher!(path);
}

// 安全字符白名单（参考文件上传过滤实践）
// 允许方括号用于动态路由参数，但限制其闭合结构
const SAFE_CHAR_RE = /^[a-z0-9_\-./[\]]+$/i;
// 成对出现且内容合法
function hasValidBrackets(path: string) {
  return (
    (path.match(/$$/g) || []).length === (path.match(/$$/g) || []).length &&
    !/$$[^\w-]+$$/.test(path)
  );
}

/**
 * 将 Babel 产生的调试源信息对象转换为 DSValue 格式
 *
 * @param source - Babel 生成的位置信息对象，包含 fileName, lineNumber, columnNumber
 * @returns DSValue 对象或 undefined
 */
export function reactBabel2DSValue(source?: AnyObject | null): DSValue | undefined {
  if (!source) return;
  return {
    file: source.fileName,
    line: source.lineNumber,
    column: source.columnNumber,
  };
}
