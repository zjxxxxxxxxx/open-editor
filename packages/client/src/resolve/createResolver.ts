import { type DSValue } from '@open-editor/shared/debugSource';
import { isValidFileName, normalizeName } from './resolveUtil';
import { type CodeSourceMeta } from '.';

/**
 * React 解析器配置项
 * @template T 表示 React 节点类型，默认为任意类型
 */
export interface ResolverOptions<T = any> {
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
  getSource(v: T): DSValue | null | undefined;

  /**
   * 获取节点显示名称
   *
   * @param v 当前节点
   *
   * @returns 返回组件的展示名称
   */
  getName(v: T): string | undefined;
}

export type Resolver<T = any> = ReturnType<typeof createResolver<T>>;

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
export function createResolver<T = any>(opts: ResolverOptions<T>) {
  // 解构配置方法
  const { isValid, getNext, getSource, getName } = opts;

  function resolver(currentNode: T | null | undefined, tree: CodeSourceMeta[], deep?: boolean) {
    // 使用 while 循环遍历同级节点链
    while (currentNode) {
      const source = getSource(currentNode);

      // 获取下一个待处理节点（初始为当前节点的 next）
      let nextNode = getNext(currentNode);

      // 判断是否为有效源代码路径
      if (isValidFileName(source?.file)) {
        // 获取最近的有效节点（跳过无效节点）
        nextNode = getValidNextNode(nextNode);

        // 没有有效后续节点时退出
        if (!nextNode) return;

        // 构建元数据并存入结果树
        tree.push({
          name: normalizeName(getName(nextNode)),
          ...source,
        } as CodeSourceMeta);

        // 非深度模式收集首个有效节点后退出
        if (!deep) return;
      }

      // 移动到下一个节点继续处理
      currentNode = nextNode;
    }
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

  return resolver;
}
