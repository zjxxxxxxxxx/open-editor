import { hasOwnProperty } from '@open-editor/shared';
import { checkValidElement } from '../utils/checkElement';

/**
 * 调试信息解析结果类型
 * @template T 调试值的类型
 */
export type ResolveDebug<T = any> = {
  el: HTMLElement; // DOM元素节点
  key: string; // 框架注入的调试属性键名
  value?: T | null; // 调试属性值
};

// 框架调试属性特征常量
const REACT_FIBER_PREFIX = '__reactFiber$'; // React 17+ Fiber节点属性前缀
const REACT_INSTANCE_PREFIX = '__reactInternalInstance$'; // React 15-16 实例属性前缀
const VUE3_COMPONENT_KEY = '__vueParentComponent'; // Vue3组件实例属性键
const VUE2_COMPONENT_KEY = '__vue__'; // Vue2组件实例属性键

/**
 * 解析DOM元素上的框架调试信息
 * @param el 起始DOM元素
 * @returns 包含调试信息的对象，未找到时返回undefined
 *
 * 实现原理：
 * 1. 沿DOM树向上遍历父元素
 * 2. 在每个元素上检测主流框架的调试属性
 * 3. 找到第一个有效的调试属性后立即返回
 */
export function resolveDebug(el: HTMLElement): ResolveDebug | undefined {
  while (checkValidElement(el)) {
    const frameworkKey = detectFrameworkKey(el);

    if (frameworkKey) {
      const debugValue = (el as any)[frameworkKey];
      if (debugValue) {
        return { el, key: frameworkKey, value: debugValue };
      }
    }

    // 向上遍历父元素
    el = el.parentElement!;
  }
}

/**
 * 检测元素上的框架调试属性
 * @param el 待检测的DOM元素
 * @returns 检测到的框架属性键名，未找到时返回undefined
 *
 * 检测优先级：
 * 1. Vue3 -> Vue2 -> React17+ -> React15-16
 * 基于框架流行度和版本新旧排序
 */
function detectFrameworkKey(el: HTMLElement): string | undefined {
  return detectVue3(el) || detectVue2(el) || detectReact17(el) || detectReact15(el);
}

// Vue3组件检测
function detectVue3(el: HTMLElement) {
  return hasOwnProperty(el, VUE3_COMPONENT_KEY) ? VUE3_COMPONENT_KEY : undefined;
}

// Vue2组件检测
function detectVue2(el: HTMLElement) {
  return hasOwnProperty(el, VUE2_COMPONENT_KEY) ? VUE2_COMPONENT_KEY : undefined;
}

// React 17+ Fiber节点检测
function detectReact17(el: HTMLElement) {
  return findFrameworkKey(el, REACT_FIBER_PREFIX);
}

// React 15-16 实例检测
function detectReact15(el: HTMLElement) {
  return findFrameworkKey(el, REACT_INSTANCE_PREFIX);
}

/**
 * 查找元素上以指定前缀开头的属性键
 * @param el DOM元素
 * @param prefix 目标属性前缀
 * @returns 匹配的属性键名，未找到时返回undefined
 *
 * 实现说明：
 * - 用于检测React的版本特定属性，这些属性带有随机哈希后缀
 * - 例如：__reactFiber$aj19x
 */
function findFrameworkKey(el: HTMLElement, prefix: string): string | undefined {
  return Object.keys(el).find((key) => key.startsWith(prefix));
}
