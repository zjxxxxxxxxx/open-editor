import { HTML_INSPECTOR_ELEMENT_TAG_NAME } from '../constants';
import { getOptions } from '../options';

/**
 * 元素校验规则配置
 */
const ELEMENT_VALIDATION_RULES = {
  /**
   * 跨 iframe 模式需要排除的特殊元素，仅包含自定义检测元素，不包含浏览器原生元素
   */
  crossIframe: new Set([HTML_INSPECTOR_ELEMENT_TAG_NAME]),

  /**
   * 默认模式需要排除的特殊元素，包含自定义检测元素和浏览器原生元素
   */
  default: new Set([
    HTML_INSPECTOR_ELEMENT_TAG_NAME,
    // Firefox 浏览器中移出视口区域时事件目标为 undefined
    undefined,
    // 阻止浏览器视口外区域的 HTML 元素检测
    'HTML',
  ]),
} as const;

/**
 * 验证元素有效性
 *
 * @param el - 待校验的 DOM 元素
 * @returns 是否通过有效性校验
 */
export function checkValidElement(el: HTMLElement | null): el is HTMLElement {
  // 基础有效性检查
  const isElementExist = el != null && el.isConnected;
  if (!isElementExist) return false;

  // 获取元素标签特征
  const { crossIframe } = getOptions();
  const elementTag = el.tagName;

  // 动态选择校验规则集
  const invalidTags = crossIframe
    ? ELEMENT_VALIDATION_RULES.crossIframe
    : ELEMENT_VALIDATION_RULES.default;

  // 最终有效性判定
  return !invalidTags.has(elementTag);
}
