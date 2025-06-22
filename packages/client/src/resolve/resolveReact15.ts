import { isFn } from '@open-editor/shared/type';
import { hasOwn } from '@open-editor/shared/object';
import { DS } from '@open-editor/shared/debugSource';
import { type Resolver, createResolver } from './createResolver';
import { resolveForFiber } from './resolveReact17';
import { type CodeSourceMeta } from '.';

/**
 * 解析 React 15+ 实例的组件树结构
 *
 * @param debug - 包含 React 实例的调试信息对象
 * @param tree - 组件树元数据存储数组
 * @param deep - 是否深度遍历子组件（默认false）
 *
 * React 15 架构特点：
 * - 实例通过 _currentElement 关联虚拟DOM元素
 * - 通过 _owner 属性实现组件树层级关联
 */
export function resolveReact15(instanceOrFiber: any, tree: CodeSourceMeta[], deep = false) {
  // 分支处理不同 React 版本的调试信息
  if (instanceOrFiber && hasOwn(instanceOrFiber, '_debugOwner')) {
    // React 16+ 使用 Fiber 架构，调用专用解析器
    resolveForFiber(instanceOrFiber, tree, deep);
  } else {
    // React 15 及更早版本处理逻辑
    resolveForInstance(instanceOrFiber, tree, deep);
  }
}

// 解析器单例（惰性初始化）
let resolver: Resolver;

/**
 * 解析 React 15+ 组件实例
 *
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
  tree: CodeSourceMeta[],
  deep?: boolean,
) {
  // 确保解析器初始化
  initializeResolver();
  // 执行实际解析逻辑
  resolver(instance, tree, deep);
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
  resolver ||= createResolver({
    // 验证元素有效性（函数组件或类组件）
    isValid(owner) {
      const element = owner?._currentElement;
      return (
        !!element &&
        // 函数组件检查
        (isFn(element.type) ||
          // 高阶组件检查（如 forwardRef）
          isFn(element.type?.render))
      );
    },

    // 获取父级实例（React 15 通过 _owner 属性建立层级关系）
    getNext(instance) {
      return instance?._currentElement?._owner;
    },

    getSource(instance) {
      return instance?._currentElement?.props[DS.ID];
    },

    // 解析组件名称（优先使用 displayName，其次用函数名）
    getName(owner) {
      const element = owner?._currentElement;
      if (element) {
        const component = isFn(element.type)
          ? // 普通函数组件
            element.type
          : // 高阶组件包装的 render 方法
            element.type.render;
        return component?.displayName || component?.name;
      }
    },
  });
}
