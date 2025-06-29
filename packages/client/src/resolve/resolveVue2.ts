import { DS } from '@open-editor/shared/debugSource';
import { type CodeSourceMeta } from '.';
import { type Resolver, createResolver } from './createResolver';

// 单例解析器，延迟初始化以减少启动开销
let resolver: Resolver;

/**
 * 解析 Vue 2 组件的调试元数据，并将结果推入组件树数组
 *
 * @param node - Vue 2 组件实例或 VNode
 * @param tree - 存储所有组件源码元信息的数组
 * @param deep - 是否递归向上查找祖先组件，默认为 false
 */
export function resolveVue2(node: any, tree: CodeSourceMeta[], deep = false): void {
  // 确保解析器已初始化
  initializeResolver();
  // 调用解析器，将当前节点及（可选）祖先组件信息填充到 tree
  resolver(node, tree, deep);
}

/**
 * 初始化全局单例解析器
 */
function initializeResolver(): void {
  resolver ||= createResolver({
    /** 判断节点是否合法 */
    isValid(node: any): boolean {
      return node != null;
    },

    /** 获取下一个要解析的节点，Vue2 中通过上下文的 $vnode 指向父 VNode */
    getNext(node: any): any {
      return node?.context?.$vnode;
    },

    /** 从节点上读取已注入的调试标识，包含文件、行列等信息 */
    getSource(node: any): CodeSourceMeta | undefined {
      return node?.[DS.ID];
    },

    /**
     * 获取组件名称：
     * - 首选 VNode 的 tag
     * - 其次 Ctor.options.name
     */
    getName(node: any): string | undefined {
      const opts = node?.componentOptions;
      return opts?.tag || opts?.Ctor?.options?.name;
    },
  });
}
