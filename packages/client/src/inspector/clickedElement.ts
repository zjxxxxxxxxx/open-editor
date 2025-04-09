import { applyAttrs } from '../utils/dom';
import { checkValidElement } from '../utils/checkElement';

export interface AttributeMapping {
  original: string;
  temp: string;
}

// 需要特殊处理的表单元素标签正则
const FORM_CONTROL_TAGS = new Set([
  'BUTTON', // 按钮（所有类型，包括 submit、reset、button）
  'FIELDSET', // 表单字段集（禁用时内部表单控件继承禁用状态）
  'INPUT', // 输入框（所有类型：text、checkbox、radio、file 等）
  'OPTGROUP', // 选项组（禁用时其下所有 OPTION 不可选）
  'OPTION', // 下拉选项（禁用后无法被选中）
  'SELECT', // 下拉选择框（禁用后无法展开）
  'TEXTAREA', // 多行文本输入框（禁用后不可编辑）
]);

// 当前被点击元素的引用缓存
let clickedElement: HTMLElement | null = null;

/**
 * 判断指定元素是否为当前点击元素
 *
 * @param element 待校验元素
 *
 * @returns 是否为当前点击元素
 */
export function checkClickedElement(element: HTMLElement) {
  return element === clickedElement;
}

/**
 * 设置被点击元素的属性映射
 *
 * @param event 点击事件对象
 *
 * @description
 * 1. 修改链接元素的 href 属性为临时属性，阻止默认跳转行为
 * 2. 修改表单元素的 disabled 属性为临时属性，避免阻止触发点击事件
 */
export function setupClickedElementAttrs(event: Event) {
  const targetElement = event.target as HTMLElement;

  if (checkValidElement(targetElement)) {
    swapElementAttributes(targetElement, {
      // 链接重定向控制
      href: { original: 'href', temp: 'oe-href' },
      // 表单交互控制
      disabled: { original: 'disabled', temp: 'oe-disabled' },
    });

    clickedElement = targetElement;
  }
}

/**
 * 清理被点击元素的临时属性
 * @description 还原被修改的属性并清除元素引用
 */
export function cleanClickedElementAttrs() {
  if (clickedElement) {
    swapElementAttributes(clickedElement, {
      // 恢复原始链接
      href: { original: 'oe-href', temp: 'href' },
      // 恢复表单状态
      disabled: { original: 'oe-disabled', temp: 'disabled' },
    });

    clickedElement = null;
  }
}

/**
 * 核心属性切换逻辑
 *
 * @param element 目标元素
 * @param attributeMap 属性映射配置
 *
 * @description
 * 1. 遍历父链查找所有相关元素（防止嵌套元素场景）
 * 2. 批量执行属性切换减少 DOM 操作次数
 */
function swapElementAttributes(
  element: HTMLElement,
  attributeMap: {
    href: AttributeMapping;
    disabled: AttributeMapping;
  },
) {
  const { anchorElements, formControlElements } = findRelatedElements(element);
  const { href, disabled } = attributeMap;

  // 处理所有链接元素防止默认跳转
  anchorElements.forEach((anchor) => swapAttribute(anchor, href.original, href.temp));

  // 处理表单控件保证事件传播
  formControlElements.forEach((control) =>
    swapAttribute(control, disabled.original, disabled.temp),
  );
}

/**
 * 查找元素关联节点
 *
 * @param element 起始元素
 *
 * @returns 包含所有相关元素的集合
 *
 * @description 沿 DOM 树向上查找所有 <a> 标签和表单控件元素
 */
function findRelatedElements(element: HTMLElement | null) {
  const anchorElements: HTMLElement[] = [];
  const formControlElements: HTMLElement[] = [];

  while (element) {
    if (element.tagName === 'A') {
      anchorElements.push(element);
    } else if (FORM_CONTROL_TAGS.has(element.tagName)) {
      formControlElements.push(element);
    }
    element = element.parentElement;
  }

  return { anchorElements, formControlElements };
}

/**
 * 执行单个属性切换
 *
 * @param element 目标元素
 * @param sourceAttr 原始属性名
 * @param targetAttr 目标属性名
 *
 * @description
 * 1. 使用 null 清除原属性避免残留
 * 2. 批量应用属性减少重绘次数
 */
function swapAttribute(element: HTMLElement, sourceAttr: string, targetAttr: string) {
  const attributeValue = element.getAttribute(sourceAttr);
  if (attributeValue != null) {
    applyAttrs(element, {
      // 清除原始属性
      [sourceAttr]: null,
      // 设置新属性
      [targetAttr]: attributeValue,
    });
  }
}
