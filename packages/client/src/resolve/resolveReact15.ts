import { isFn, hasOwn } from '@open-editor/shared';
import { type ResolveDebug } from './resolveDebug';
import { type ReactResolver, createReactResolver } from './createReactResolver';
import { resolveForFiber } from './resolveReact17';
import { type CodeSourceMeta } from '.';

/**
 * 解析 React 15+ 实例的组件树结构
 * @param debug - 包含 React 实例的调试信息对象
 * @param tree - 组件树元数据存储数组
 * @param deep - 是否深度遍历子组件（默认false）
 *
 * React 15 架构特点：
 * 1. 使用栈协调器（Stack Reconciler）同步递归处理组件树
 * 2. 实例通过 _currentElement 关联虚拟DOM元素
 * 3. 通过 _owner 属性实现组件树层级关联
 */
export function resolveReact15(
  { value: inst }: ResolveDebug,
  tree: Partial<CodeSourceMeta>[],
  deep = false,
) {
  // 分支处理不同React版本的调试信息
  if (inst && hasOwn(inst, '_debugOwner')) {
    // React 16+ 使用 Fiber 架构，调用专用解析器
    resolveForFiber(inst as any, tree, deep);
  } else {
    // React 15 及更早版本处理逻辑
    resolveForInstance(inst, tree, deep);
  }
}

// 解析器单例（惰性初始化）
let resolver: ReactResolver;

/**
 * 解析 React 15+ 组件实例
 * @param instance - React 组件实例
 * @param tree - 组件树元数据存储数组
 * @param deep - 是否深度遍历
 *
 * 实现原理：
 * 1. 通过 _currentElement 获取虚拟DOM元素
 * 2. 通过 _owner 属性向上遍历组件层级
 * 3. 解析组件名称和源码位置信息
 */
export function resolveForInstance(
  instance: any | null | undefined,
  tree: Partial<CodeSourceMeta>[],
  deep = false,
) {
  initializeResolver(); // 确保解析器初始化
  resolver(instance, tree, deep); // 执行实际解析逻辑
}

/**
 * 初始化 React 15 解析器配置
 *
 * 配置项说明：
 * - isValid: 验证是否为有效 React 元素
 * - getNext: 获取父级实例（通过 _owner 属性）
 * - getSource: 提取源码位置信息
 * - getName: 解析组件名称
 */
function initializeResolver() {
  resolver ||= createReactResolver({
    // 验证元素有效性（函数组件或类组件）
    isValid(owner) {
      const element = owner?._currentElement;
      return (
        !!element &&
        (isFn(element.type) || // 函数组件检查
          isFn(element.type?.render)) // 高阶组件检查（如 forwardRef）
      );
    },

    // 获取父级实例（React 15 通过 _owner 属性建立层级关系）
    getNext(instance) {
      return instance?._currentElement?._owner;
    },

    // 提取源码元数据（Babel 编译时注入的 __source 属性）
    getSource(instance) {
      return instance?._currentElement?._source;
    },

    // 解析组件名称（优先使用 displayName，其次用函数名）
    getName(owner) {
      const element = owner?._currentElement;
      if (element) {
        const component = isFn(element.type)
          ? element.type // 普通函数组件
          : element.type.render; // 高阶组件包装的 render 方法
        return component?.displayName || component?.name;
      }
    },
  });
}
