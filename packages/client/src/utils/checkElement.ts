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
 *
 * @returns 是否通过有效性校验
 *
 * 验证流程：
 * 1. 基础存在性校验（非空检查/DOM 挂载状态）
 * 2. 获取元素标签特征
 * 3. 根据运行模式选择校验规则集
 * 4. 执行最终有效性判定
 */
export function checkValidElement(el: HTMLElement | null): el is HTMLElement {
  // 阶段1：基础有效性检查
  const isElementExist = el != null && el.isConnected;
  if (!isElementExist) return false;

  // 阶段2：获取元素标签特征
  const { crossIframe } = getOptions();
  const elementTag = el.tagName;

  // 阶段3：动态选择校验规则集
  const invalidTags = crossIframe
    ? ELEMENT_VALIDATION_RULES.crossIframe
    : ELEMENT_VALIDATION_RULES.default;

  // 阶段4：最终有效性判定
  return !invalidTags.has(elementTag);
}
