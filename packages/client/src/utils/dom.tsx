import { Fragment } from '../../jsx/jsx-runtime';

/**
 * DOM 属性操作工具集，包含属性设置、子节点管理、样式处理等常用功能
 */

// ====================== 属性操作 ======================
/**
 * 安全设置元素属性（支持空值自动移除）
 *
 * @param el 目标元素
 * @param attrs 属性键值对
 *
 * @example
 * applyAttrs(div, {
 *   'data-id': '123',
 *   title: null // 移除title属性
 * })
 */
export function applyAttrs(el: HTMLElement, attrs: Record<string, unknown>) {
  for (const [key, value] of Object.entries(attrs)) {
    // 空值处理策略：null/undefined 移除属性，0/false 保留属性值
    if (value != null) {
      el.setAttribute(key, String(value));
    } else {
      el.removeAttribute(key);
    }
  }
}

// ====================== 子节点管理 ======================
/**
 * 递归追加子节点（支持Fragment解构）
 *
 * @param el 父容器
 * @param children 子节点数组
 *
 * @remarks 使用文档片段优化批量插入性能
 */
export function appendChild(el: HTMLElement | ShadowRoot, ...children: HTMLElement[]) {
  for (const child of children) {
    if (child.tagName === Fragment) {
      // Fragment解包：递归插入其子节点
      appendChild(el, ...(Array.from(child.children) as HTMLElement[]));
    } else {
      el.appendChild(child);
    }
  }
}

/**
 * 安全替换子节点（兼容 Shadow DOM）
 *
 * @remarks 手动实现而非使用原生 replaceChildren，确保浏览器兼容性
 */
export function replaceChildren(el: HTMLElement | ShadowRoot, ...children: HTMLElement[]) {
  // 批量删除优化：直接清空比逐个删除更高效
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
  appendChild(el, ...children);
}

// ====================== 可见性检测 ======================
/**
 * 检测元素可见性（DOM 树连接性 + display 继承链）
 *
 * @remarks
 * 实现与官方草案差异：忽略 visibility/content-visibility，专注 display 检测
 */
export function checkVisibility(el: HTMLElement) {
  if (!el.isConnected) return false;

  let current: HTMLElement | null = el;
  while (current) {
    // 获取计算样式避免内联样式干扰
    const display = createStyleGetter(current)('display', false);
    if (display === 'none') return false;
    current = current.parentElement;
  }
  return true;
}

// ====================== 样式处理工具 ======================
/**
 * CSS 单位转换工具集
 *
 * @remarks 数值转换避免样式字符串拼接错误
 */
export const CssUtils = {
  /** 数值转像素单位 */
  numberToPx(value: string | number) {
    return `${value}px`;
  },

  /** 解析样式值为数字（空值返回 0） */
  parseValue(value: string) {
    return Number.parseFloat(value) || 0;
  },

  /** 生成 translate 变换函数 */
  translate(x: number, y: number) {
    return `translate(${CssUtils.numberToPx(x)}, ${CssUtils.numberToPx(y)})`;
  },
};

/**
 * 批量应用样式对象
 *
 * @remarks 使用 Object.assign 优化多次样式操作
 */
export function applyStyle(
  el: HTMLElement,
  ...styles: Array<PartialWithNull<CSSStyleDeclaration>>
): void {
  Object.assign(el.style, ...styles);
}

/**
 * 创建计算样式获取器
 *
 * @param toNumber 是否自动转换为数值类型
 *
 * @example
 * const getStyle = createStyleGetter(div);
 * // 返回 number 类型
 * const width = getStyle('width');
 */
export function createStyleGetter(el: HTMLElement) {
  const computedStyle = window.getComputedStyle(el);

  return function <T extends boolean = true>(
    property: string,
    // @ts-ignore
    toNumber: T = true,
  ): T extends true ? number : string {
    const value = computedStyle.getPropertyValue(property);
    return (toNumber ? CssUtils.parseValue(value) : value) as any;
  };
}

// ====================== 类名操作 ======================
/**
 * 安全添加类名（支持空格分隔的多类名）
 *
 * @remarks
 * 使用 classList 代替 className 操作
 */
export function addClass(el: HTMLElement, className: string) {
  el.classList.add(...className.trim().split(/\s+/));
}

/**
 * 安全移除类名（支持空格分隔的多类名）
 */
export function removeClass(el: HTMLElement, className: string) {
  el.classList.remove(...className.trim().split(/\s+/));
}
