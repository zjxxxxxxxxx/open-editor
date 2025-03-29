/**
 * JSX元素转换核心模块
 * 提供虚拟DOM到真实DOM的转换能力，支持SVG元素和Fragment处理
 */
import { on } from '../src/event';

// 虚拟节点类型常量
const FRAGMENT_TYPE = 'INTERNAL_VIRTUAL_FRAGMENT';
const JSX_MARK = '__oe_jsx'; // DOM元素标记属性

// SVG命名空间及支持的标签类型
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const SVG_TAGS = new Set([
  // 基础形状元素
  'svg',
  'path',
  'circle',
  'rect',
  'ellipse',
  'line',
  'polygon',
  'polyline',

  // 文本相关
  'text',
  'tspan',
  'textPath',

  // 容器元素
  'g',
  'defs',
  'symbol',
  'use',
  'marker',

  // 渐变与图案
  'linearGradient',
  'radialGradient',
  'pattern',
  'stop',

  // 图像与媒体
  'image',
  'foreignObject',

  // 路径与标记
  'clipPath',
  'mask',
  'marker',

  // 动画元素
  'animate',
  'animateMotion',
  'animateTransform',

  // 滤镜相关
  'filter',
  'feGaussianBlur',
  'feColorMatrix',
  'feComposite',

  // 交互元素
  'a',
  'view',

  // 复杂形状
  'radialGradient',
  'mesh',
  'hatch',

  // 特殊效果
  'mask',
  'filter',
  'feDropShadow',
]);

/**
 * JSX元素创建函数
 * @param {string|Function} type - 元素类型（标签名或组件函数）
 * @param {Object} props - 元素属性对象
 * @param {string} [props.className] - CSS类名
 * @param {Object} [props.style] - 行内样式对象
 * @param {Function} [props.ref] - 元素引用回调
 * @param {Array} [children] - 子元素数组（通过Babel自动填充）
 * @returns {HTMLElement} 生成的DOM元素
 */
function jsx(type, props) {
  const { ref, className, style, children, ...attrs } = props;

  // 处理组件函数类型
  if (typeof type === 'function') {
    return type({ ...props, children });
  }

  // 创建元素或文档片段
  const element = createElement(type, { className, style });

  // 设置元素属性（Fragment不处理属性）
  if (type !== FRAGMENT_TYPE) {
    setElementAttributes(element, attrs);
    if (ref) ref(element);
  }

  // 递归处理子节点
  if (children != null) {
    appendChildren(element, Array.isArray(children) ? children : [children]);
  }

  return element;
}

/**
 * 创建基础DOM元素
 * @param {string} tagName - 元素标签名
 * @param {Object} options - 创建选项
 * @returns {Element} 创建的DOM元素
 */
function createElement(tagName, { className, style }) {
  const element = SVG_TAGS.has(tagName)
    ? document.createElementNS(SVG_NAMESPACE, tagName)
    : document.createElement(tagName);

  element.setAttribute(JSX_MARK, ''); // 设置标记属性
  if (className) element.className = className;
  if (style) Object.assign(element.style, style);

  return element;
}

/**
 * 设置元素属性及事件监听
 * @param {Element} element - 目标元素
 * @param {Object} attrs - 属性键值对
 */
function setElementAttributes(element, attrs) {
  for (const [prop, value] of Object.entries(attrs)) {
    if (value == null) continue;

    if (isEventAttribute(prop)) {
      const eventType = prop.slice(2).toLowerCase();
      on(eventType, value, { target: element });
    } else {
      element.setAttribute(prop, value);
    }
  }
}

/**
 * 递归追加子节点
 * @param {Node} parent - 父节点
 * @param {Array} children - 子节点数组
 */
function appendChildren(parent, children) {
  for (const child of children) {
    if (!child) continue;

    if (child.tagName === FRAGMENT_TYPE) {
      appendChildren(parent, Array.from(child.children));
    } else if (child instanceof Element) {
      parent.appendChild(child);
    } else if (Array.isArray(child)) {
      appendChildren(parent, child);
    } else {
      parent.appendChild(document.createTextNode(child.toString()));
    }
  }
}

/**
 * 判断是否是事件属性
 * @param {string} prop - 属性名
 * @returns {boolean}
 */
function isEventAttribute(prop) {
  return /^on[A-Z]/.test(prop);
}

// 导出模块接口
export { jsx, jsx as jsxs, FRAGMENT_TYPE as Fragment };
