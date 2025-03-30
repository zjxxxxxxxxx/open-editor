import { isFn } from '@open-editor/shared';
import { type Fiber } from 'react-reconciler';
import { type ReactResolver, createReactResolver } from './createReactResolver';
import { type ResolveDebug } from './resolveDebug';
import { type CodeSourceMeta } from '.';
/**
 * React 17+ Fiber架构核心调试解析器
 *
 * React 17+架构特点：
 * 1. 基于Fiber树的链表结构实现可中断渲染
 * 2. 使用双缓存机制维护current/workInProgress两棵树
 * 3. 通过_debugSource获取Babel编译时注入的源码定位信息
 * 4. 通过_debugOwner建立组件层级关系
 */
export function resolveReact17(
  { value: node }: ResolveDebug<Fiber>,
  tree: CodeSourceMeta[],
  deep?: boolean,
) {
  resolveForFiber(node, tree, deep);
}

// 解析器单例（惰性初始化）
let resolver: ReactResolver<Fiber>;

/**
 * 解析Fiber节点树结构
 * @param fiber - 当前Fiber节点（React 17+核心数据结构）
 * @param tree - 组件树元数据存储数组
 * @param deep - 是否深度遍历子组件
 *
 * 实现原理：
 * 1. 利用_debugOwner向上遍历组件层级
 * 2. 通过_debugSource获取源码元数据
 * 3. 采用深度优先遍历策略
 */
export function resolveForFiber(
  fiber: Fiber | null | undefined,
  tree: CodeSourceMeta[],
  deep?: boolean,
) {
  initializeResolver(); // 确保解析器初始化
  resolver(fiber, tree, deep);
}

/**
 * 初始化Fiber解析器配置
 *
 * 配置项说明：
 * - isValid: 验证是否为有效React元素（过滤宿主节点等非组件元素）
 * - getNext: 获取父级节点（遵循React调试API规范）
 * - getSource: 提取Babel注入的源码定位信息
 * - getName: 解析组件显示名称（支持高阶组件）
 */
function initializeResolver() {
  resolver ||= createReactResolver({
    isValid(owner) {
      // 存在_debugSource说明是开发者编写的组件节点
      // 过滤原生DOM节点（如div/span等宿主组件）
      return (
        !!owner?._debugSource &&
        (isFn(owner.type) || // 函数组件检查
          isFn(owner.type?.render)) // 类组件检查
      );
    },

    getNext(fiber) {
      // 通过_debugOwner获取父级组件节点
      // 注意与child/return指针的区别（调试指针 vs 渲染指针）
      return fiber?._debugOwner;
    },

    getSource(fiber) {
      // 获取Babel编译时注入的源码元数据
      // 包含fileName/lineNumber/columnNumber等定位信息
      return fiber?._debugSource;
    },

    getName(owner) {
      if (!owner) return undefined;

      // 处理普通组件和高阶组件包装
      const component = isFn(owner.type)
        ? owner.type // 普通函数组件/类组件
        : owner.type?.render; // React.forwardRef等包装组件

      // 优先级：displayName > 函数名 > 匿名组件占位符
      return component?.displayName || component?.name;
    },
  });
}
