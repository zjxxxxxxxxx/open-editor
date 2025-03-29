import { IS_CLIENT } from '../constants';
import { appendChild } from './dom';

/**
 * 创建全局样式管理器
 * @param css - 需要注入的CSS字符串
 * @returns 包含挂载/卸载方法的样式控制器
 *
 * 功能特性：
 * 1. 服务端环境兼容处理
 * 2. 自动避免重复挂载
 * 3. 样式优先级控制（插入body末尾覆盖现有样式）
 * 4. 内存泄漏防护（卸载时彻底移除节点）
 */
export function createGlobalStyle(css: string) {
  // 服务端环境返回空操作对象
  if (!IS_CLIENT) {
    return {
      mount() {}, // 空函数保持接口统一
      unmount() {},
    };
  }

  // 创建样式节点
  const styleNode = <style type="text/css">{css}</style>;

  // 样式控制器方法集
  return {
    /**
     * 挂载样式到文档
     * 设计策略：
     * - 插入body末尾确保样式优先级
     * - 检查节点连接状态避免重复操作
     */
    mount() {
      if (!styleNode.isConnected) {
        appendChild(document.body, styleNode);
      }
    },

    /**
     * 从文档移除样式
     * 安全措施：
     * - 操作前检查节点连接状态
     * - 彻底移除节点防止内存泄漏
     */
    unmount() {
      if (styleNode.isConnected) {
        styleNode.remove();
      }
    },
  };
}
