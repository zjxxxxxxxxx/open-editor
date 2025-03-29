import { isPromise } from 'node:util/types';
import { ExecSyncOptions, execSync } from 'node:child_process';
import { PathOrFileDescriptor, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'node:path';

/* ******************************** 项目路径常量 ******************************** */

/**
 * 项目根目录路径
 * 通过当前模块的URL解析获得，向上返回一级目录
 */
export const projectRoot = convertURLToPath(import.meta.url, '../');

/**
 * 客户端包根目录路径
 * 基于项目根目录下的 packages/client 目录
 */
export const clientRoot = resolve(projectRoot, 'packages/client');

/**
 * 共享代码包根目录路径
 * 基于项目根目录下的 packages/shared 目录
 */
export const sharedRoot = resolve(projectRoot, 'packages/shared');

/**
 * Rollup 包根目录路径
 * 基于项目根目录下的 packages/rollup 目录
 */
export const rollupRoot = resolve(projectRoot, 'packages/rollup');

/**
 * Vite 包根目录路径
 * 基于项目根目录下的 packages/vite 目录
 */
export const viteRoot = resolve(projectRoot, 'packages/vite');

/**
 * Webpack 包根目录路径
 * 基于项目根目录下的 packages/webpack 目录
 */
export const webpackRoot = resolve(projectRoot, 'packages/webpack');

/**
 * 所有 playground 目录列表
 * 读取项目根目录下 playgrounds 文件夹中的内容
 */
export const playgrounds = readdirSync(resolve(projectRoot, 'playgrounds'));

/* ******************************** 核心工具函数 ******************************** */

/**
 * 将URL转换为本地文件路径并拼接相对路径
 * @param baseURL - 基准URL字符串
 * @param relativePath - 需要拼接的相对路径
 * @returns 完整的本地文件系统路径
 */
export function convertURLToPath(baseURL: string, relativePath: string) {
  return fileURLToPath(new URL(relativePath, baseURL));
}

/**
 * 读取并解析JSON文件
 * @param filePath - 目标文件路径或文件描述符
 * @returns 解析后的JSON对象
 */
export function readJSON(filePath: PathOrFileDescriptor) {
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

/**
 * 将数据写入JSON文件（自动格式化）
 * @param filePath - 目标文件路径或文件描述符
 * @param payload - 要写入的数据，支持对象或已格式化的字符串
 */
export function writeJSON(filePath: PathOrFileDescriptor, payload: object | string) {
  const content = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2) + '\n';

  writeFileSync(filePath, content, 'utf-8');
}

/**
 * 同步执行命令行指令
 * @param command - 需要执行的命令字符串
 * @param options - 执行配置项（可选）
 * @default options
 * @property stdio - 继承父进程的输入输出
 * @property encoding - 使用UTF-8编码
 */
export function executeCommand(command: string, options: ExecSyncOptions = {}) {
  return execSync(command, {
    stdio: 'inherit',
    encoding: 'utf-8',
    ...options,
  });
}

/**
 * 安全执行函数并处理异常退出
 * @param operation - 需要执行的操作函数
 * @description
 * 1. 捕获同步代码异常
 * 2. 处理异步Promise rejection
 * 3. 异常发生时以状态码1退出进程
 */
export function safeExecute(operation: () => unknown | void) {
  try {
    const result = operation();

    // 处理异步操作
    if (isPromise(result)) {
      return result.catch(() => process.exit(1));
    }
  } catch {
    process.exit(1);
  }
}
