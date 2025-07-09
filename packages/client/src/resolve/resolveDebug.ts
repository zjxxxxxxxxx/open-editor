import { hasOwn } from '@open-editor/shared/object';
import { DS } from '@open-editor/shared/debugSource';
import { checkValidElement } from '../utils/checkElement';

/**
 * 调试信息解析结果类型
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

/**
 * 解析 DOM 元素上的框架调试信息
 * @param el 起始 DOM 元素
 * @returns 包含调试信息的对象，未找到时返回 undefined
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
 * @param el 待检测的 DOM 元素
 * @returns 检测到的框架属性键名，未找到时返回 undefined
 */
function detectFrameworkKey(el: HTMLElement) {
  return detectVue3(el) || detectVue2(el) || detectReact17(el) || detectReact15(el);
}

// Vue3 组件检测
function detectVue3(el: HTMLElement) {
  return hasOwn(el, DS.VUE_V3) ? DS.VUE_V3 : undefined;
}

// Vue2 组件检测
function detectVue2(el: HTMLElement) {
  return hasOwn(el, DS.VUE_V2) ? DS.VUE_V2 : undefined;
}

// React 17+ Fiber 节点检测
function detectReact17(el: HTMLElement) {
  return findFrameworkKey(el, DS.REACT_17);
}

// React 15-16 实例检测
function detectReact15(el: HTMLElement) {
  return findFrameworkKey(el, DS.REACT_15);
}

/**
 * 查找元素上以指定前缀开头的属性键
 * @param el DOM 元素
 * @param prefix 目标属性前缀
 * @returns 匹配的属性键名，未找到时返回 undefined
 */
function findFrameworkKey(el: HTMLElement, prefix: string) {
  return Object.keys(el).find((key) => key.startsWith(prefix));
}
