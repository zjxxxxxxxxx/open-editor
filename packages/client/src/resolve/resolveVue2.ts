import { DS } from '@open-editor/shared/debugSource';
import { type VueResolver, createVueResolver } from './createVueResolver';
import { type ResolveDebug } from './resolveDebug';
import { type CodeSourceMeta } from '.';

// 解析器单例（惰性初始化）
let resolver: VueResolver;

/**
 * Vue2 组件解析入口
 *
 * @param debug - 调试上下文对象，包含当前组件实例
 * @param tree - 组件树元数据存储数组
 * @param deep - 是否深度遍历父级组件
 *
 * 实现原理：
 * 1. 从 _vnode.componentInstance 获取真实的组件实例
 * 2. 通过 $parent 向上遍历组件层级
 * 3. 通过 __source 属性获取源码元数据
 * 4. 支持异步组件和动态组件解析
 */
export function resolveVue2(debug: ResolveDebug, tree: CodeSourceMeta[], deep?: boolean) {
  // 获取真正的组件实例（处理抽象节点情况）
  const componentInstance = debug.value._vnode?.componentInstance;
  if (componentInstance) {
    // 更新调试上下文为实际组件实例
    debug.value = componentInstance;
  }

  // 确保解析器初始化
  initializeResolver();
  resolver(debug, tree, deep);
}

/**
 * 初始化 Vue 解析器配置
 *
 * 配置项说明：
 * - isValid: 验证是否为有效组件实例（过滤非 Vue 实例）
 * - getNext: 获取父级组件实例（遵循 Vue 实例继承链）
 * - getSource: 提取 Babel 编译注入的源码定位信息
 * - getFile: 获取组件物理文件路径（支持 webpack/vite 不同环境）
 * - getName: 解析组件显示名称（支持匿名组件）
 */
function initializeResolver() {
  resolver ||= createVueResolver({
    /**
     * 验证有效组件实例
     *
     * 原理：通过 $vnode 属性判断是否为真实 Vue 组件
     */
    isValid(node): node is any {
      return !!node?.$vnode;
    },

    /**
     * 获取父级组件实例，注意与 $parent 的区别：此处返回的是直接父级，而非根实例
     */
    getNext(node) {
      // 遵循 Vue 组件层级结构
      return node.$parent;
    },

    /**
     * 提取源码元数据
     *
     * 实现策略：
     * 1. 查找组件 props 中的 __source（Babel 插件注入）
     * 2. 向上遍历父组件直到找到有效源码信息
     */
    getSource(node) {
      let current = node;
      while (current) {
        // JSX 编译注入的源码信息
        const dsString = current.$props?.[DS.ID];
        if (dsString) return DS.parse(dsString);
        // 向上遍历继承链
        current = current.$parent;
      }
    },

    /**
     * 获取组件物理文件路径
     *
     * 兼容策略：
     * 1. 优先使用 __file（webpack 环境）
     * 2. 回退到 options.__file（Vue CLI 项目）
     * 3. 最终使用组件构造函数名
     */
    getFile(node) {
      const ctor = getComponentConstructor(node);
      return ctor.__file || ctor.options?.__file;
    },

    /**
     * 获取组件显示名称
     *
     * 优先级：
     * 1. 注册的组件名（components 选项）
     * 2. 文件名称（当使用单文件组件时）
     */
    getName(node) {
      const ctor = getComponentConstructor(node);
      return ctor.options.name;
    },
  });

  /**
   * 获取组件构造函数
   *
   * 实现原理：
   * 1. 通过 componentOptions.Ctor 获取原始构造函数
   * 2. 处理 Vue.extend 生成的构造函数
   */
  function getComponentConstructor(node: any) {
    return node.$vnode.componentOptions.Ctor;
  }
}
