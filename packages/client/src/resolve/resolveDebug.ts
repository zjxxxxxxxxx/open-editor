import { hasOwn } from '@open-editor/shared/object';
import { checkValidElement } from '../utils/checkElement';

/**
 * 调试信息解析结果类型
 *
 * @template T 调试值的类型
 */
export interface ResolveDebug<T = any> {
  /**
   * 框架类型
   */
  framework: 'react' | 'vue';
  /**
   * DOM 元素节点
   */
  el: HTMLElement;
  /**
   * 框架注入的调试属性键名
   */
  key: string;
  /**
   * 调试属性值
   */
  value?: T | null;
}

// 框架调试属性特征常量
const REACT_FIBER_PREFIX = '__reactFiber$'; // React 17+ Fiber 节点属性前缀
const REACT_INSTANCE_PREFIX = '__reactInternalInstance$'; // React 15-16 实例属性前缀
const VUE3_COMPONENT_KEY = '__vueParentComponent'; // Vue3 组件实例属性键
const VUE2_COMPONENT_KEY = '__vue__'; // Vue2 组件实例属性键

/**
 * 解析 DOM 元素上的框架调试信息
 *
 * @param el 起始 DOM 元素
 *
 * @returns 包含调试信息的对象，未找到时返回 undefined
 *
 * 实现原理：
 * 1. 沿 DOM 树向上遍历父元素
 * 2. 在每个元素上检测主流框架的调试属性
 * 3. 找到第一个有效的调试属性后立即返回
 */
export function resolveDebug(el: HTMLElement): ResolveDebug | undefined {
  while (checkValidElement(el)) {
    const frameworkKey = detectFrameworkKey(el);

    if (frameworkKey) {
      const debugValue = (el as any)[frameworkKey];
      if (debugValue) {
        return {
          framework: frameworkKey.includes('react') ? 'react' : 'vue',
          el,
          key: frameworkKey,
          value: debugValue,
        };
      }
    }

    // 向上遍历父元素
    el = el.parentElement!;
  }
}

/**
 * 检测元素上的框架调试属性
 *
 * @param el 待检测的 DOM 元素
 *
 * @returns 检测到的框架属性键名，未找到时返回 undefined
 *
 * 检测优先级：
 * 1. Vue3 -> Vue2 -> React17+ -> React15-16
 * 基于框架流行度和版本新旧排序
 */
function detectFrameworkKey(el: HTMLElement) {
  return detectVue3(el) || detectVue2(el) || detectReact17(el) || detectReact15(el);
}

// Vue3 组件检测
function detectVue3(el: HTMLElement) {
  return hasOwn(el, VUE3_COMPONENT_KEY) ? VUE3_COMPONENT_KEY : undefined;
}

// Vue2 组件检测
function detectVue2(el: HTMLElement) {
  return hasOwn(el, VUE2_COMPONENT_KEY) ? VUE2_COMPONENT_KEY : undefined;
}

// React 17+ Fiber 节点检测
function detectReact17(el: HTMLElement) {
  return findFrameworkKey(el, REACT_FIBER_PREFIX);
}

// React 15-16 实例检测
function detectReact15(el: HTMLElement) {
  return findFrameworkKey(el, REACT_INSTANCE_PREFIX);
}

/**
 * 查找元素上以指定前缀开头的属性键
 *
 * @param el DOM 元素
 * @param prefix 目标属性前缀
 *
 * @returns 匹配的属性键名，未找到时返回 undefined
 *
 * 实现说明：
 * - 用于检测 React 的版本特定属性，这些属性带有随机哈希后缀
 * - 例如：__reactFiber$aj19x
 */
function findFrameworkKey(el: HTMLElement, prefix: string) {
  return Object.keys(el).find((key) => key.startsWith(prefix));
}
