import { DS } from '@open-editor/shared/debugSource';
import { type CodeSourceMeta } from '.';
import { type Resolver, createResolver } from './createResolver';

// 解析器单例（惰性初始化）
let resolver: Resolver;

/**
 * Vue2 组件解析入口
 *
 * @param debug - 调试上下文对象，包含当前组件实例
 * @param tree - 组件树元数据存储数组
 * @param deep - 是否深度遍历父级组件
 */
export function resolveVue2(node: any, tree: CodeSourceMeta[], deep?: boolean) {
  initializeResolver();
  resolver(node, tree, deep);
}

function initializeResolver() {
  resolver ||= createResolver({
    isValid(node: any) {
      return !!node;
    },

    getNext(node: any) {
      return node?.context?.$vnode;
    },

    getSource(node: any) {
      return node?.data?.attrs?.[DS.ID];
    },

    getName(node: any) {
      return node?.componentOptions?.tag;
    },
  });
}
