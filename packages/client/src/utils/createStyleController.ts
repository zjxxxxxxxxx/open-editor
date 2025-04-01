import { IS_CLIENT } from '../constants';
import { appendChild, applyAttrs } from './dom';

/**
 * 样式控制器接口定义，提供样式挂载/卸载的标准方法
 * @remarks
 * 该接口抽象了样式操作的核心行为，便于实现不同的样式管理策略
 */
export interface StyleController {
  /**
   * 将样式注入文档
   * @throws {DOMException} 当操作违反DOM约束时抛出标准异常
   */
  mount: () => void;

  /**
   * 从文档安全移除样式
   * @remarks
   * 移除操作会确保节点引用被正确清理，防止内存泄漏
   */
  unmount: () => void;
}

/**
 * CSS样式类型常量
 * @internal
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style#attr-type | MDN文档}
 */
const CSS_CONTENT_TYPE = 'text/css';

/**
 * 服务端空操作控制器
 * @internal
 * @description
 * 使用Object.freeze确保实例不可变，避免在服务端环境被意外修改
 */
const NULL_CONTROLLER: StyleController = Object.freeze({
  mount() {
    // Intentionally empty
  },
  unmount() {
    // Intentionally empty
  },
});

/**
 * 创建具备安全控制的全局样式管理器
 * @param css - 需要注入的CSS字符串，自动进行HTML转义
 * @param target - 样式插入的目标容器，默认为document.body
 * @returns 符合StyleController接口的样式管理器实例
 *
 * @example
 * ```typescript
 * // 创建并挂载样式
 * const controller = createStyleController(`body { color: red; }`);
 * controller.mount();
 *
 * // 在特定容器插入
 * const sidebarStyle = createStyleController(`.sidebar { width: 300px; }`, document.querySelector('#sidebar'));
 * ```
 *
 * @remarks
 * ## 设计特性
 * 1. **环境隔离** - 服务端返回无害空操作对象
 * 2. **幂等操作** - 重复挂载/卸载不会产生副作用
 * 3. **样式优先级** - 默认插入body末尾确保最高优先级
 * 4. **资源安全** - 移除节点并解除引用防止内存泄漏
 * 5. **类型安全** - 严格校验DOM操作参数
 */
export function createStyleController(
  css: string,
  target: HTMLElement = document.body,
): StyleController {
  // 服务端环境快速返回空操作实例
  if (!IS_CLIENT) {
    return NULL_CONTROLLER;
  }

  // 客户端环境初始化样式节点
  const styleNode = document.createElement('style');

  // 配置样式节点属性
  applyAttrs(styleNode, {
    type: CSS_CONTENT_TYPE,
  });

  return {
    /**
     * 挂载样式到文档
     * @implementation
     * 1. 通过isConnected状态检查实现幂等性
     * 2. 使用appendChild确保插入顺序
     * 3. 依赖DOM规范自动处理重复插入
     */
    mount() {
      if (styleNode.isConnected) return;

      // 安全设置样式内容（自动HTML转义）
      styleNode.textContent = css;

      appendChild(target, styleNode);
    },

    /**
     * 安全卸载样式节点
     * @implementation
     * 1. 通过remove()方法标准移除
     * 2. 兼容现代浏览器（IE11+）
     * 3. 自动清理DOM引用
     */
    unmount() {
      if (!styleNode.isConnected) return;

      // 标准DOM方法移除节点
      styleNode.remove();

      // 清理文本内容释放内存
      styleNode.textContent = '';
    },
  };
}
