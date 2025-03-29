import { normalizePath } from '@open-editor/shared';
import { type Source } from 'react-reconciler';
import { ensureFileName, isValidFileName } from './resolveUtil';
import { type CodeSourceMeta } from '.';

// 配置项接口：定义解析React组件树的行为规范
export interface ReactResolverOptions<T = any> {
  /** 验证节点是否有效 */
  isValid(v?: T): boolean;
  /** 获取下一个关联节点 */
  getNext(v: T): T | null | undefined;
  /** 获取源代码位置信息 */
  getSource(v: T): (Source & { columnNumber?: number }) | null | undefined;
  /** 获取节点显示名称 */
  getName(v: T): string | undefined;
}

export type ReactResolver<T = any> = ReturnType<typeof createReactResolver<T>>;

/**
 * 创建React组件树解析器
 * @param opts 解析器配置选项
 * @returns 返回可用于遍历React组件树的解析函数
 */
export function createReactResolver<T = any>(opts: ReactResolverOptions<T>) {
  // 解构配置方法并添加类型注解
  const { isValid, getNext, getSource, getName } = opts;

  /**
   * 核心解析函数
   * @param currentNode 当前遍历节点
   * @param sourceTree 源代码元数据树的引用
   * @param deepMode 是否深度遍历模式
   */
  function reactResolver(
    currentNode: T | null | undefined,
    sourceTree: Partial<CodeSourceMeta>[],
    deepMode: boolean,
  ) {
    while (currentNode) {
      // 规范化源代码路径信息
      const normalizedSource = normalizeSourceInfo(getSource(currentNode));

      // 获取下一个待处理节点
      let nextNode = getNext(currentNode);

      // 处理有效文件路径的情况
      if (isValidFileName(normalizedSource?.fileName)) {
        // 获取最近的有效节点
        nextNode = getValidNextNode(nextNode);

        if (!nextNode) return;

        // 构建元数据并加入结果树
        addSourceMetadata(nextNode, normalizedSource!, sourceTree);

        // 非深度模式立即返回
        if (!deepMode) return;
      }

      // 移动到下一个节点
      currentNode = nextNode;
    }
  }

  /**
   * 规范化源代码路径信息
   * @param source 原始源代码信息
   * @returns 返回处理后的标准格式源代码信息
   */
  function normalizeSourceInfo(source: (Source & { columnNumber?: number }) | null | undefined) {
    if (!source) return source;

    // 标准化文件路径格式
    return {
      ...source,
      fileName: ensureFileName(normalizePath(source.fileName)),
    };
  }

  /**
   * 获取有效后续节点
   * @param initialNode 起始节点
   * @returns 返回第一个有效节点或undefined
   */
  function getValidNextNode(initialNode: T | null | undefined) {
    let node = initialNode;
    while (node && !isValid(node)) {
      node = getNext(node);
    }
    return node;
  }

  /**
   * 添加源代码元数据到结果树
   * @param node 目标节点
   * @param source 源代码信息
   * @param tree 结果树的引用
   */
  function addSourceMetadata(
    node: T,
    source: NonNullable<ReturnType<typeof normalizeSourceInfo>>,
    tree: Partial<CodeSourceMeta>[],
  ) {
    tree.push({
      name: getName(node) || 'AnonymousComponent',
      file: source.fileName,
      line: source.lineNumber,
      column: source.columnNumber,
    });
  }

  return reactResolver;
}
