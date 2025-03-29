/**
 * 路径解析工具模块
 * 提供跨平台路径解析能力，适配不同操作系统的路径格式
 */

import { createRequire } from 'node:module';
import { normalizePath } from './normalizePath';

/**
 * 解析规范化后的模块路径
 * @param path 需要解析的原始路径
 * @param url 基准路径，用于创建自定义 require 上下文
 * @returns 经过规范化处理的完整模块路径
 */
export function resolvePath(
  /**
   * 待解析的原始路径
   * - 支持相对路径（如 './utils'）
   * - 支持绝对路径（如 '/src/components'）
   * - 支持模块名（如 'lodash'）
   */
  path: string,
  /**
   * 基准路径上下文
   * - 用于创建独立的模块解析上下文
   * - 应当为有效的文件系统路径
   */
  url: string,
): string {
  // 规范化输入路径，确保跨平台路径一致性
  const normalizedUrl = normalizePath(url);
  const normalizedPath = normalizePath(path);

  // 创建基于规范化路径的自定义 require 实例
  const customRequire = createRequire(normalizedUrl);

  // 在指定上下文中解析模块路径
  return customRequire.resolve(normalizedPath);
}
