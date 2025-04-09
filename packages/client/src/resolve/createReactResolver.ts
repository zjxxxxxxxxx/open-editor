import { normalizePath } from '@open-editor/shared';
import { type Source } from 'react-reconciler';
import { ensureFileName, isValidFileName, normalizeMeta } from './resolveUtil';
import { type CodeSourceMeta } from '.';

/**
 * React 解析器配置项
 * @template T 表示 React 节点类型，默认为任意类型
 */
export interface ReactResolverOptions<T = any> {
  /**
   * 节点有效性验证函数
   *
   * @param v 待验证的节点
   *
   * @returns 返回该节点是否有效的布尔值
   */
  isValid(v?: T): boolean;

  /**
   * 获取后续关联节点
   *
   * @param v 当前节点
   *
   * @returns 返回下一个关联节点或 null/undefined
   */
  getNext(v: T): T | null | undefined;

  /**
   * 获取源代码定位信息
   *
   * @param v 当前节点
   *
   * @returns 返回包含文件名、行列号的源代码信息对象
   */
  getSource(v: T): (Source & { columnNumber?: number }) | null | undefined;

  /**
   * 获取节点显示名称
   *
   * @param v 当前节点
   *
   * @returns 返回组件的展示名称
   */
  getName(v: T): string | undefined;
}

/**
 * React 解析器类型
 *
 * @template T React 节点类型
 */
export type ReactResolver<T = any> = ReturnType<typeof createReactResolver<T>>;

/**
 * 创建 React 组件树解析器（工厂函数）
 *
 * @template T React 节点类型
 *
 * @param opts 解析器配置项
 *
 * @returns 返回组件树解析函数
 *
 * --------------------------------------------------
 * 工作流程：
 * 1. 接收配置项初始化解析器
 * 2. 通过 reactResolver 函数遍历组件树
 * 3. 对每个节点执行：
 *    a. 标准化源代码路径
 *    b. 验证节点有效性
 *    c. 提取元数据
 *    d. 根据模式决定遍历深度
 * --------------------------------------------------
 */
export function createReactResolver<T = any>(opts: ReactResolverOptions<T>) {
  // 解构配置方法
  const { isValid, getNext, getSource, getName } = opts;

  /**
   * 核心解析函数
   *
   * @param currentNode 当前处理的节点（初始为根节点）
   * @param tree 元数据存储树（用于收集结果）
   * @param deep 是否启用深度遍历模式
   *
   * --------------------------------------------------
   * 遍历逻辑：
   * 1. 循环处理当前节点链
   * 2. 对每个节点执行：
   *    a. 获取标准化后的源码信息
   *    b. 定位下一个有效节点
   *    c. 有效文件路径节点处理：
   *       - 非深度模式：收集元数据后立即返回
   *       - 深度模式：继续遍历子节点
   * --------------------------------------------------
   */
  function reactResolver(
    currentNode: T | null | undefined,
    tree: CodeSourceMeta[],
    deep?: boolean,
  ) {
    // 使用 while 循环遍历同级节点链
    while (currentNode) {
      // 步骤1：标准化源码信息
      const normalizedSource = normalizeSourceInfo(getSource(currentNode));

      // 步骤2：获取下一个待处理节点（初始为当前节点的 next）
      let nextNode = getNext(currentNode);

      // 判断是否为有效源代码路径
      if (isValidFileName(normalizedSource?.fileName)) {
        // 步骤3：获取最近的有效节点（跳过无效节点）
        nextNode = getValidNextNode(nextNode);

        // 终止条件：没有有效后续节点时退出
        if (!nextNode) return;

        // 步骤4：构建元数据并存入结果树
        addSourceMetadata(nextNode, normalizedSource!, tree);

        // 模式判断：非深度模式收集首个有效节点后退出
        if (!deep) return;
      }

      // 步骤5：移动到下一个节点继续处理
      currentNode = nextNode;
    }
  }

  /**
   * 源代码信息标准化处理器
   *
   * @param source 原始源码信息
   *
   * @returns 标准化后的源码信息对象
   *
   * --------------------------------------------------
   * 处理逻辑：
   * 1. 统一路径分隔符为斜杠(/)
   * 2. 确保文件名有效性
   * 3. 保留行列号信息
   * --------------------------------------------------
   */
  function normalizeSourceInfo(source: (Source & { columnNumber?: number }) | null | undefined) {
    if (!source) return source;

    return {
      ...source,
      // 标准化文件路径：转换分隔符并验证文件名
      fileName: ensureFileName(normalizePath(source.fileName)),
    };
  }

  /**
   * 有效节点过滤器
   *
   * @param initialNode 过滤起始节点
   *
   * @returns 第一个通过有效性验证的节点
   *
   * --------------------------------------------------
   * 遍历逻辑：
   * 1. 从初始节点开始遍历
   * 2. 跳过无效节点直到找到第一个有效节点
   * 3. 返回有效节点或undefined
   * --------------------------------------------------
   */
  function getValidNextNode(initialNode: T | null | undefined) {
    let node = initialNode;
    // 循环过滤无效节点
    while (node && !isValid(node)) {
      node = getNext(node);
    }
    return node;
  }

  /**
   * 元数据收集器
   *
   * @param node 目标节点
   * @param source 标准化源码信息
   * @param tree 结果树引用
   *
   * --------------------------------------------------
   * 数据组装过程：
   * 1. 从节点获取显示名称
   * 2. 组合标准化后的源码定位信息
   * 3. 推入结果树前进行数据规范化
   * --------------------------------------------------
   */
  function addSourceMetadata(
    node: T,
    source: NonNullable<ReturnType<typeof normalizeSourceInfo>>,
    tree: CodeSourceMeta[],
  ) {
    tree.push(
      normalizeMeta({
        name: getName(node),
        file: source.fileName,
        line: source.lineNumber,
        column: source.columnNumber,
      }),
    );
  }

  return reactResolver;
}
