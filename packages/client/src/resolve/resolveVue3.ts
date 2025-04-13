import { type ComponentInternalInstance } from '@vue/runtime-core';
import { type VueResolver, createVueResolver } from './createVueResolver';
import { type ResolveDebug } from './resolveDebug';
import { type CodeSourceMeta } from '.';

// 单例解析器（基于 Vue3 的响应式系统特性）
let resolver: VueResolver<ComponentInternalInstance>;

/**
 * Vue3 组件解析入口函数
 *
 * @param debug - 调试上下文对象，包含当前组件实例
 * @param tree - 组件树元数据存储数组
 * @param deep - 是否深度遍历父级组件
 *
 * Vue3 实现特点：
 * 1. 基于 composition API 的组件实例结构
 * 2. 通过 parent 属性访问父级实例
 * 3. 依赖 __file 和 __name 等编译时元数据
 * 4. 支持 Suspense 和 Teleport 等内置组件
 */
export function resolveVue3(debug: ResolveDebug, tree: CodeSourceMeta[], deep?: boolean) {
  // 确保解析器初始化
  initializeResolver();
  resolver(debug, tree, deep);
}

/**
 * 初始化 Vue3 解析器配置
 *
 * 配置项优化点：
 * - 处理 Suspense 组件边界
 * - 支持 script setup 语法
 * - 兼容 Vite 的热更新标识
 */
function initializeResolver() {
  resolver ||= createVueResolver({
    /**
     * 验证有效组件实例
     *
     * 过滤条件：
     * 1. 非空实例
     * 2. 非 KeepAlive 缓存占位符
     * 3. 排除内置组件（Suspense/Teleport）
     */
    isValid(node): node is ComponentInternalInstance {
      return (
        !!node &&
        // 过滤 KeepAlive 缓存实例
        !node.isDeactivated &&
        // 排除内置组件
        typeof node.type !== 'symbol'
      );
    },

    /**
     * 获取父级组件实例
     *
     * 注意差异：Vue3 的 parent 属性可能指向：
     * 1. 普通父组件
     * 2. Suspense 边界组件
     * 3. Teleport 容器组件
     */
    getNext(node) {
      return node.parent && '__asyncLoader' in node.parent.type
        ? // 处理异步组件边界
          node.parent.parent
        : node.parent;
    },

    /**
     * 提取源码元数据
     *
     * 优先级：
     * 1. 组件 props 中的 __source（需配合 compilerOptions 启用）
     * 2. 父组件链中的最近有效源
     * 3. 组件自身的 __file 元数据
     */
    getSource(node) {
      let current = node;
      while (current) {
        // 处理 Suspense 包裹的异步组件
        const rawSource =
          (current as any)?.suspense?.parent?.props?.__source || current.props?.__source;
        if (rawSource) return String(rawSource);

        // 处理 Teleport 组件特殊情况
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
     *
     * 名称解析顺序：
     * 1. 显式定义的 __name 属性
     * 2. 通过 defineComponent 的 name 选项
     * 3. 自动推断的 setup 函数名称
     * 4. 文件名称（当使用 SFC 时）
     */
    getName(node) {
      const type = node.type;
      return (
        type.__name || type.name || type.displayName || type.__file?.match(/([^/]+)\.vue$/)?.[1]
      );
    },
  });
}
