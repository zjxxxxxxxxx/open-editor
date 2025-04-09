import { on } from '../src/event';

// 虚拟节点类型常量
const FRAGMENT_TYPE = 'INTERNAL_VIRTUAL_FRAGMENT';
// DOM 元素标记属性
const JSX_MARK = '__oe_jsx';

// SVG 命名空间及支持的标签类型
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
 * JSX 元素创建函数
 */
function jsx(type, props) {
  const { ref, className, style, children, ...attrs } = props;

  // 处理组件函数类型
  if (typeof type === 'function') {
    return type({ ...props, children });
  }

  // 创建元素或文档片段
  const element = createElement(type, { className, style });

  // 设置元素属性（Fragment 不处理属性）
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
 * 创建基础 DOM 元素
 *
 * @param tagName - 元素标签名
 * @param options - 创建选项
 *
 * @returns 创建的 DOM 元素
 */
function createElement(tagName, { className, style }) {
  const element = SVG_TAGS.has(tagName)
    ? document.createElementNS(SVG_NAMESPACE, tagName)
    : document.createElement(tagName);

  // 设置标记属性
  element.setAttribute(JSX_MARK, '');

  if (className) element.className = className;
  if (style) Object.assign(element.style, style);

  return element;
}

/**
 * 设置元素属性及事件监听
 *
 * @param element - 目标元素
 * @param attrs - 属性键值对
 */
function setElementAttributes(element, attrs) {
  for (const [prop, value] of Object.entries(attrs)) {
    if (value == null) continue;

    if (/^on[A-Z]/.test(prop)) {
      const eventType = prop.slice(2).toLowerCase();
      on(eventType, value, { target: element });
    } else {
      element.setAttribute(prop, value);
    }
  }
}

/**
 * 递归追加子节点
 *
 * @param parent - 父节点
 * @param children - 子节点数组
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

// 导出模块接口
export { jsx, jsx as jsxs, FRAGMENT_TYPE as Fragment };
