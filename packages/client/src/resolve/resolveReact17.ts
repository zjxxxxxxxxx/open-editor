import { isFn } from '@open-editor/shared/type';
import { DS } from '@open-editor/shared/debugSource';
import { type Fiber } from 'react-reconciler';
import { type Resolver, createResolver } from './createResolver';
import { type CodeSourceMeta } from '.';

/**
 * React 17+ Fiber 架构核心调试解析器
 *
 * React 17+架构特点：
 * - 通过 _debugSource 获取 Babel 编译时注入的源码定位信息
 * - 通过 _debugOwner 建立组件层级关系
 */
export function resolveReact17(fiber: Fiber, tree: CodeSourceMeta[], deep?: boolean) {
  resolveForFiber(fiber, tree, deep);
}

// 解析器单例（惰性初始化）
let resolver: Resolver<Fiber>;

/**
 * 解析 Fiber 节点树结构
 *
 * @param fiber - 当前 Fiber 节点（React 17+ 核心数据结构）
 * @param tree - 组件树元数据存储数组
 * @param deep - 是否深度遍历子组件
 *
 * 实现原理：
 * 1. 利用 _debugOwner 向上遍历组件层级
 * 2. 通过 _debugSource 获取源码元数据
 * 3. 采用深度优先遍历策略
 */
export function resolveForFiber(
  fiber: Fiber | null | undefined,
  tree: CodeSourceMeta[],
  deep?: boolean,
) {
  // 确保解析器初始化
  initializeResolver();
  resolver(fiber, tree, deep);
}

/**
 * 初始化 Fiber 解析器配置
 *
 * 配置项说明：
 * - isValid: 验证是否为有效 React 元素（过滤宿主节点等非组件元素）
 * - getNext: 获取父级节点（遵循 React 调试 API 规范）
 * - getSource: 提取 Babel 注入的源码定位信息
 * - getName: 解析组件显示名称（支持高阶组件）
 */
function initializeResolver() {
  resolver ||= createResolver({
    isValid(owner) {
      // 存在 _debugSource 说明是开发者编写的组件节点
      // 过滤原生DOM节点（如 div/span 等宿主组件）
      return (
        !!owner &&
        // 函数组件检查
        (isFn(owner.type) ||
          // 类组件检查
          isFn(owner.type?.render))
      );
    },

    getNext(fiber) {
      // 通过 _debugOwner 获取父级组件节点
      // 注意与 child/return 指针的区别（调试指针 vs 渲染指针）
      return fiber?._debugOwner;
    },

    getSource(fiber) {
      return fiber?.memoizedProps[DS.ID];
    },

    getName(owner) {
      if (!owner) return;

      // 处理普通组件和高阶组件包装
      const component = isFn(owner.type)
        ? // 普通函数组件/类组件
          owner.type
        : // React.forwardRef 等包装组件
          owner.type?.render;

      // 优先级：displayName > 函数名 > 匿名组件占位符
      return component?.displayName || component?.name;
    },
  });
}
