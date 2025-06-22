import { DS } from '@open-editor/shared/debugSource';
import { type CodeSourceMeta } from '.';
import { type Resolver, createResolver } from './createResolver';

// 单例解析器（基于 Vue3 的响应式系统特性）
let resolver: Resolver<any>;

/**
 * Vue3 组件解析入口函数
 *
 * @param debug - 调试上下文对象，包含当前组件实例
 * @param tree - 组件树元数据存储数组
 * @param deep - 是否深度遍历父级组件
 */
export function resolveVue3(node: any, tree: CodeSourceMeta[], deep?: boolean) {
  initializeResolver();
  resolver(node, tree, deep);
}

/**
 * 初始化 Vue3 解析器配置
 */
function initializeResolver() {
  resolver ||= createResolver({
    isValid(node: any) {
      return !!node;
    },

    getNext(node: any) {
      return node?.ctx?.vnode;
    },

    getSource(node: any) {
      return node?.props?.[DS.ID];
    },

    getName(node: any) {
      const type = node.type;
      return type.name || type.displayName || type.__name;
    },
  });
}
