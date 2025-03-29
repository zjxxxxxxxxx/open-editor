import outmatch from 'outmatch';
import { getOptions } from '../options';

/**
 * 浏览器环境路径处理工具
 * 实现路径标准化、文件名校验等安全功能
 */

// 浏览器路径分隔符标准化（统一为斜杠）
function normalizePath(path: string) {
  return path.replace(/\\/g, '/');
}

/**
 * 安全路径生成（防止路径遍历攻击）
 * @example
 * ensureFileName('/project/src/../../secret.txt') => 'secret.txt'
 */
export function ensureFileName(filePath: string): string {
  const { rootDir } = getOptions();
  const normalizedRoot = normalizePath(rootDir);
  const normalizedPath = normalizePath(filePath);

  // 移除根目录前缀（使用字符串操作代替Node.js路径API）
  if (normalizedPath.startsWith(normalizedRoot)) {
    return normalizedPath
      .replace(normalizedRoot, '')
      .replace(/^\/+/g, '') // 移除前缀斜杠
      .replace(/\/{2,}/g, '/'); // 合并多余斜杠
  }

  // 防御相对路径攻击（参考Path Manipulation漏洞处理）
  return normalizedPath
    .replace(/\.\.\//g, '') // 移除父目录标识
    .replace(/\/+/g, '/');
}

// 系统级黑名单路径（参考CI环境路径限制）
const SYSTEM_BLACKLIST = /^(\/home\/runner|\/tmp\/build)/;

/**
 * 文件名安全校验（满足双重校验原则）
 * 1. 防止系统敏感路径访问
 * 2. 过滤项目配置的glob模式
 */
export function isValidFileName(filePath?: string | null): filePath is string {
  if (!filePath) return false;

  const normalized = normalizePath(filePath);

  // 双重安全校验（黑名单 + 项目规则）
  return !SYSTEM_BLACKLIST.test(normalized) && applyProjectIgnoreRules(normalized);
}

// 安全字符白名单（参考文件上传过滤实践）
const SAFE_CHAR_RE = /^[a-z0-9_\-./]+$/i;

/**
 * 项目级忽略规则处理器
 * 结合glob模式和白名单字符校验
 */
let globMatcher: ReturnType<typeof outmatch> | null = null;
function applyProjectIgnoreRules(path: string): boolean {
  const { ignoreComponents } = getOptions();

  // 基础字符白名单校验
  if (!SAFE_CHAR_RE.test(path)) return false;

  // 空配置默认放行
  if (!ignoreComponents) return true;

  // 惰性初始化glob匹配器（配置浏览器环境参数）
  globMatcher ||= outmatch(ignoreComponents, {
    separator: '/', // 浏览器路径统一使用斜杠
    excludeDot: false, // 允许点文件
  });

  return !globMatcher!(path);
}
