import { DS } from '@open-editor/shared/debugSource';
import { type CodeSourceMeta } from '.';
import { type Resolver, createResolver } from './createResolver';

// 单例解析器，利用 Vue 3 的响应式上下文链条
let resolver: Resolver<any>;

/**
 * 解析 Vue 3 组件实例的调试元数据，并将结果注入到组件树数组中
 *
 * @param node  - Vue 3 组件实例（setup 返回对象或 vnode.proxy）
 * @param tree  - 接收所有组件源码元信息的数组
 * @param deep  - 是否向上递归遍历祖先组件（默认为 false）
 */
export function resolveVue3(node: any, tree: CodeSourceMeta[], deep = false): void {
  initializeResolver();
  // 使用解析器对当前节点及其（可选）祖先进行扫描
  resolver(node, tree, deep);
}

/**
 * 延迟初始化全局单例解析器
 */
function initializeResolver(): void {
  resolver ||= createResolver({
    /**
     * 判断当前节点是否有效
     */
    isValid(node: any): boolean {
      return node != null;
    },

    /**
     * 获取下一个要解析的节点
     */
    getNext(node: any): any {
      return node?.ctx?.vnode;
    },

    /**
     * 获取已注入的调试源信息
     */
    getSource(node: any): CodeSourceMeta | undefined {
      return node?.props?.[DS.ID];
    },

    /**
     * 获取组件名
     */
    getName(node: any): string | undefined {
      const type = node.type;
      return type.name || type.displayName || type.__name;
    },
  });
}
