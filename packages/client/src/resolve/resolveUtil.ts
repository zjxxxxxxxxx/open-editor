import { camelCase, normalizePath } from '@open-editor/shared';
import outmatch from 'outmatch';
import { getOptions } from '../options';
import { CodeSourceMeta } from '.';

const DEFAULT_COMPONENT_NAME = 'AnonymousComponent';
const DEFAULT_COMPONENT_FILE = 'unknown';
/**
 * 元数据标准化处理器
 * @param meta - 原始元数据
 * @returns 标准化后的元数据对象
 *
 * 处理逻辑：
 * 1. 组件名称驼峰化
 * 2. 文件路径校验
 * 3. 行列号默认值处理（源码行列号从1开始）
 */
export function normalizeMeta(meta: Partial<CodeSourceMeta>): CodeSourceMeta {
  return {
    name: meta.name ? camelCase(meta.name) : DEFAULT_COMPONENT_NAME, // 统一命名规范
    file: meta.file || DEFAULT_COMPONENT_FILE, // 文件路径兜底处理
    line: meta.line || 1, // 确保最小行号为1
    column: meta.column || 1, // 确保最小列号为1
  };
}

/**
 * 安全路径生成（防止路径遍历攻击）
 * @example
 * ensureFileName('/project/src/../../secret.txt') => 'secret.txt'
 */
export function ensureFileName(filePath: string) {
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
// 允许方括号用于动态路由参数，但限制其闭合结构
const SAFE_CHAR_RE = /^[a-z0-9_\-./[\]]+$/i;
// 增加闭合性校验：成对出现且内容合法
function hasValidBrackets(path: string) {
  return (
    (path.match(/$$/g) || []).length === (path.match(/$$/g) || []).length &&
    !/$$[^\w-]+$$/.test(path)
  );
}

/**
 * 项目级忽略规则处理器
 * 结合glob模式和白名单字符校验
 */
let globMatcher: ReturnType<typeof outmatch> | null = null;
function applyProjectIgnoreRules(path: string) {
  const { ignoreComponents } = getOptions();

  // 基础字符白名单校验
  if (!SAFE_CHAR_RE.test(path) || !hasValidBrackets(path)) return false;

  // 空配置默认放行
  if (!ignoreComponents) return true;

  // 惰性初始化glob匹配器（配置浏览器环境参数）
  globMatcher ||= outmatch(ignoreComponents, {
    separator: '/',
    excludeDot: false,
  });
  return !globMatcher!(path);
}
