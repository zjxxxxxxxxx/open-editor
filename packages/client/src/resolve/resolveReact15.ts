import { isFn } from '@open-editor/shared/type';
import { hasOwn } from '@open-editor/shared/object';
import { DS } from '@open-editor/shared/debugSource';
import { type Resolver, createResolver } from './createResolver';
import { resolveForFiber } from './resolveReact17';
import { reactBabel2DSValue } from './resolveUtil';
import { type CodeSourceMeta } from '.';

// 单例解析器，延迟初始化以减少重复开销
let resolver: Resolver<any>;

/**
 * 解析 React 15+ 组件实例或 Fiber，自动分流到对应版本的解析器
 *
 * @param instanceOrFiber - React 组件实例或 Fiber 节点
 * @param tree             - 用于收集组件源码元信息的数组
 * @param deep             - 是否递归向上遍历父组件（默认为 false）
 */
export function resolveReact15(instanceOrFiber: any, tree: CodeSourceMeta[], deep = false): void {
  // React16+ 的 Fiber 架构在实例上包含 _debugOwner
  if (instanceOrFiber && hasOwn(instanceOrFiber, '_debugOwner')) {
    // 委托给 Fiber 版解析器处理
    resolveForFiber(instanceOrFiber, tree, deep);
  } else {
    // 走传统 React15 解析逻辑
    resolveForInstance(instanceOrFiber, tree, deep);
  }
}

/**
 * 解析 React 15 及更早版本的组件实例
 *
 * @param instance - React 组件实例对象
 * @param tree     - 接收组件源码元信息的数组
 * @param deep     - 是否递归向上遍历父组件（默认为 false）
 */
export function resolveForInstance(
  instance: any | null | undefined,
  tree: CodeSourceMeta[],
  deep = false,
): void {
  // 确保解析器已初始化
  initializeResolver();
  // 执行解析，将结果推入 tree
  resolver(instance, tree, deep);
}

/**
 * 初始化 React 15 组件解析器
 */
function initializeResolver(): void {
  resolver ??= createResolver<any>({
    /**
     * 判断实例是否为 React 组件实例节点：
     * - _currentElement 必须存在
     * - element.type 为函数或包装 render 方法
     */
    isValid(owner: any): boolean {
      const element = owner?._currentElement;
      return !!element && (isFn(element.type) || isFn((element.type as any)?.render));
    },

    /**
     * 获取父级组件实例，通过 _currentElement._owner 链接
     */
    getNext(owner: any): any {
      return owner?._currentElement?._owner;
    },

    /**
     * 提取源码定位信息：
     * - 优先使用 props[DS.ID] 注入值
     * - 回退到 Babel 编译注入的 _source
     */
    getSource(owner: any): CodeSourceMeta | undefined {
      const element = owner?._currentElement;
      return element?.props?.[DS.ID] ?? reactBabel2DSValue(element?._source);
    },

    /**
     * 解析组件名称：
     * - 函数组件直接使用 displayName 或 name
     * - HOC 包装组件使用 render 方法上的 name
     */
    getName(owner: any): string {
      const element = owner?._currentElement;
      const comp = isFn(element.type) ? element.type : element.type.render;
      return comp?.displayName ?? comp.name;
    },
  });
}
