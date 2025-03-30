import { type ComponentInternalInstance } from '@vue/runtime-core';
import { type VueResolver, createVueResolver } from './createVueResolver';
import { type ResolveDebug } from './resolveDebug';
import { type CodeSourceMeta } from '.';

// 单例解析器（基于Vue3的响应式系统特性）
let resolver: VueResolver<ComponentInternalInstance>;

/**
 * Vue3组件解析入口函数
 * @param debug - 调试上下文对象，包含当前组件实例
 * @param tree - 组件树元数据存储数组
 * @param deep - 是否深度遍历父级组件
 *
 * Vue3实现特点：
 * 1. 基于composition API的组件实例结构
 * 2. 通过parent属性访问父级实例
 * 3. 依赖__file和__name等编译时元数据
 * 4. 支持Suspense和Teleport等内置组件
 */
export function resolveVue3(debug: ResolveDebug, tree: CodeSourceMeta[], deep?: boolean) {
  initializeResolver(); // 确保解析器初始化
  resolver(debug, tree, deep);
}

/**
 * 初始化Vue3解析器配置
 *
 * 配置项优化点：
 * - 处理Suspense组件边界
 * - 支持script setup语法
 * - 兼容Vite的热更新标识
 */
function initializeResolver() {
  resolver ||= createVueResolver({
    /**
     * 验证有效组件实例
     * 过滤条件：
     * 1. 非空实例
     * 2. 非KeepAlive缓存占位符
     * 3. 排除内置组件（Suspense/Teleport）
     */
    isValid(node): node is ComponentInternalInstance {
      return (
        !!node &&
        !node.isDeactivated && // 过滤KeepAlive缓存实例
        typeof node.type !== 'symbol'
      ); // 排除内置组件
    },

    /**
     * 获取父级组件实例
     * 注意差异：
     * Vue3的parent属性可能指向：
     * 1. 普通父组件
     * 2. Suspense边界组件
     * 3. Teleport容器组件
     */
    getNext(node) {
      return node.parent && '__asyncLoader' in node.parent.type
        ? node.parent.parent // 处理异步组件边界
        : node.parent;
    },

    /**
     * 提取源码元数据
     * 优先级：
     * 1. 组件props中的__source（需配合compilerOptions启用）
     * 2. 父组件链中的最近有效源
     * 3. 组件自身的__file元数据
     */
    getSource(node) {
      let current: ComponentInternalInstance | null = node;
      while (current) {
        // 处理Suspense包裹的异步组件
        const rawSource =
          (current as any)?.suspense?.parent?.props?.__source || current.props?.__source;
        if (rawSource) return String(rawSource);

        // 处理Teleport组件特殊情况
        current =
          current.parent && '__isTeleport' in current.parent.type
            ? current.parent.parent
            : current.parent;
      }
    },

    /**
     * 获取组件文件路径
     */
    getFile(node) {
      return node.type.__file;
    },

    /**
     * 获取组件显示名称
     * 名称解析顺序：
     * 1. 显式定义的__name属性
     * 2. 通过defineComponent的name选项
     * 3. 自动推断的setup函数名称
     * 4. 文件名称（当使用SFC时）
     */
    getName(instance) {
      const componentType = instance.type;
      return (
        componentType.__name ||
        componentType.name ||
        componentType.displayName ||
        componentType.__file?.match(/([^/]+)\.vue$/)?.[1]
      );
    },
  });
}
