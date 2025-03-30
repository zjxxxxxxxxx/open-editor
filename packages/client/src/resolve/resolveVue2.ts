import { type VueResolver, createVueResolver } from './createVueResolver';
import { type ResolveDebug } from './resolveDebug';
import { type CodeSourceMeta } from '.';

// 解析器单例（惰性初始化）
let resolver: VueResolver;

/**
 * Vue2组件解析入口
 * @param debug - 调试上下文对象，包含当前组件实例
 * @param tree - 组件树元数据存储数组
 * @param deep - 是否深度遍历父级组件
 *
 * 实现原理：
 * 1. 从_vnode.componentInstance获取真实的组件实例
 * 2. 通过$parent向上遍历组件层级
 * 3. 通过__source属性获取源码元数据
 * 4. 支持异步组件和动态组件解析
 */
export function resolveVue2(debug: ResolveDebug, tree: CodeSourceMeta[], deep?: boolean) {
  // 获取真正的组件实例（处理抽象节点情况）
  const componentInstance = debug.value._vnode?.componentInstance;
  if (componentInstance) {
    debug.value = componentInstance; // 更新调试上下文为实际组件实例
  }

  initializeResolver(); // 确保解析器初始化
  resolver(debug, tree, deep);
}

/**
 * 初始化Vue解析器配置
 *
 * 配置项说明：
 * - isValid: 验证是否为有效组件实例（过滤非Vue实例）
 * - getNext: 获取父级组件实例（遵循Vue实例继承链）
 * - getSource: 提取Babel编译注入的源码定位信息
 * - getFile: 获取组件物理文件路径（支持webpack/vite不同环境）
 * - getName: 解析组件显示名称（支持匿名组件）
 */
function initializeResolver() {
  resolver ||= createVueResolver({
    /**
     * 验证有效组件实例
     * 原理：通过$vnode属性判断是否为真实Vue组件
     */
    isValid(node) {
      return !!node?.$vnode;
    },

    /**
     * 获取父级组件实例
     * 注意与$parent的区别：此处返回的是直接父级，而非根实例
     */
    getNext(node) {
      return node.$parent; // 遵循Vue组件层级结构
    },

    /**
     * 提取源码元数据
     * 实现策略：
     * 1. 查找组件props中的__source（Babel插件注入）
     * 2. 向上遍历父组件直到找到有效源码信息
     */
    getSource(node) {
      let current = node;
      while (current) {
        const source = current.$props?.__source; // JSX编译注入的源码信息
        if (source) return source;
        current = current.$parent; // 向上遍历继承链
      }
    },

    /**
     * 获取组件物理文件路径
     * 兼容策略：
     * 1. 优先使用__file（webpack环境）
     * 2. 回退到options.__file（Vue CLI项目）
     * 3. 最终使用组件构造函数名
     */
    getFile(node) {
      const ctor = getComponentConstructor(node);
      return ctor.__file || ctor.options?.__file;
    },

    /**
     * 获取组件显示名称
     * 优先级：
     * 1. 注册的组件名（components选项）
     * 2. 文件名称（当使用单文件组件时）
     */
    getName(node) {
      const ctor = getComponentConstructor(node);
      return ctor.options.name;
    },
  });

  /**
   * 获取组件构造函数
   * 实现原理：
   * 通过componentOptions.Ctor获取原始构造函数
   * 处理Vue.extend生成的构造函数
   */
  function getComponentConstructor(node: any) {
    return node.$vnode.componentOptions.Ctor;
  }
}
