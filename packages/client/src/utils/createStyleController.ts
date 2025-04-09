import { jsx } from '../../jsx/jsx-runtime';
import { IS_CLIENT } from '../constants';
import { appendChild } from './dom';

/**
 * 样式控制器的抽象接口，定义样式生命周期管理契约
 *
 * @remarks
 * 实现该接口的类应确保样式操作的原子性和资源安全性，
 * 推荐通过{@link createStyleController}工厂方法创建标准实现
 */
export type StyleController = ReturnType<typeof createStyleController>;

/**
 * 服务端环境使用的无操作样式控制器
 *
 * @remarks
 * 通过 Object.freeze 深度冻结确保实例不可变，防止在服务端渲染(SSR)环境中
 * 被意外修改而产生副作用
 */
const NULL_CONTROLLER = Object.freeze({
  mount() {
    // SSR 环境空操作
  },
  unmount() {
    // SSR 环境空操作
  },
});

/**
 * 创建具有安全控制的样式管理器实例
 *
 * @param css - 需要注入的 CSS 样式规则字符串，需确保已正确转义特殊字符
 * @param target - 样式插入的目标容器节点，默认使用 document.body
 *
 * @returns 符合当前运行环境的样式控制器实例
 *
 * @example 基础用法
 * ```typescript
 * // 创建并挂载样式
 * const controller = createStyleController(`body { color: red; }`);
 * controller.mount();
 *
 * // 在特定容器插入样式
 * const sidebarAnchor = document.querySelector('#sidebar-anchor');
 * const sidebarStyle = createStyleController(`.sidebar { width: 300px; }`, sidebarAnchor);
 * ```
 *
 * @remarks
 * ### 实现细节
 * 1. **环境自适应** - 服务端环境返回无害空操作实现
 * 2. **样式隔离** - 每个实例管理独立样式节点
 * 3. **引用安全** - 通过闭包隔离节点引用，防止外部篡改
 * 4. **DOM 操作优化** - 复用现有样式节点，避免重复插入
 *
 * ### 浏览器兼容性
 * - 支持所有现代浏览器(Chrome/Firefox/Safari/Edge)
 */
export function createStyleController(css: string, target: HTMLElement = document.body) {
  // 非浏览器环境返回空操作控制器
  if (!IS_CLIENT) {
    return NULL_CONTROLLER;
  }

  // 通过闭包维护样式节点引用
  let styleNode: HTMLStyleElement | null = null;

  return {
    /**
     * 挂载样式到文档
     *
     * @implementation
     * 1. 幂等性检查：通过 styleNode 存在性判断
     * 2. 节点创建：使用 JSX 运行时创建 <style> 元素
     * 3. 安全插入：通过a ppendChild 保证插入顺序
     */
    mount() {
      if (!styleNode) {
        styleNode = jsx('style', {
          type: 'text/css',
          children: css,
        });
        appendChild(target, styleNode);
      }
    },

    /**
     * 卸载样式节点
     *
     * @implementation
     * 1. 安全移除：调用 remove() 代替 removeChild 提升性能
     * 2. 引用清理：重置 styleNode 防止过时引用
     * 3. 容错处理：在节点不存在时静默返回
     */
    unmount() {
      if (styleNode) {
        styleNode.remove();
        styleNode = null;
      }
    },
  };
}
