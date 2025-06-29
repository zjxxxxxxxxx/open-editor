import { isFn } from '@open-editor/shared/type';
import { DS } from '@open-editor/shared/debugSource';
import { type Fiber } from 'react-reconciler';
import { type Resolver, createResolver } from './createResolver';
import { reactBabel2DSValue } from './resolveUtil';
import { type CodeSourceMeta } from '.';

// 单例解析器，延迟初始化以减少开销，专用于 React17+ Fiber
let resolver: Resolver<Fiber>;

/**
 * 解析 React 17+ Fiber 节点，抽取组件层级与源码定位信息
 *
 * 此函数为主入口，会调用 resolveForFiber 以支持在多处复用同一逻辑
 *
 * @param fiber - 当前 Fiber 节点（可能为 null 或 undefined）
 * @param tree  - 用于收集所有组件源信息的数组
 * @param deep  - 是否递归向上遍历所有父组件，默认为 false
 */
export function resolveReact17(
  fiber: Fiber | null | undefined,
  tree: CodeSourceMeta[],
  deep = false,
): void {
  resolveForFiber(fiber, tree, deep);
}

/**
 * 解析 Fiber 树中所有相关节点，支持在其他场景复用
 *
 * @param fiber - 起始 Fiber 节点
 * @param tree  - 组件源码元信息集合
 * @param deep  - 是否深度遍历组件层级，默认为 false
 */
export function resolveForFiber(
  fiber: Fiber | null | undefined,
  tree: CodeSourceMeta[],
  deep = false,
): void {
  // 确保解析器已初始化
  initializeResolver();
  // 调用单例解析器处理节点
  resolver(fiber, tree, deep);
}

/**
 * 初始化全局单例解析器
 */
function initializeResolver(): void {
  resolver ??= createResolver<Fiber>({
    /**
     * 判断当前 Fiber 是否为开发者编写的组件节点：
     * 1. 节点存在且类型为函数组件或类组件
     */
    isValid(node: Fiber | null | undefined): boolean {
      if (!node) return false;
      return isFn(node.type) || isFn((node.type as any)?.render);
    },

    /**
     * 获取父级 Fiber 节点，使用 React Debug API 链接 _debugOwner
     */
    getNext(node: Fiber): Fiber | null | undefined {
      return node._debugOwner;
    },

    /**
     * 提取源码定位信息：
     * - 优先读取 Babel 注入的 props[DS.ID]
     * - 回退到 React 内部 _debugSource
     */
    getSource(node: Fiber): CodeSourceMeta | undefined {
      return node.memoizedProps?.[DS.ID] ?? reactBabel2DSValue(node._debugSource);
    },

    /**
     * 获取组件展示名称：
     * - 对于高阶组件（HOC）优先使用 wrapped render 函数的 name
     * - 函数组件或类组件直接使用 displayName 或 name
     */
    getName(node: Fiber): string {
      const comp = isFn(node.type) ? node.type : node.type?.render;
      return comp?.displayName ?? comp?.name;
    },
  });
}
