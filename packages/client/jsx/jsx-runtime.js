import { on } from '../src/event';

// 虚拟节点类型常量，用于创建 DocumentFragment
const FRAGMENT_TYPE = Symbol('INTERNAL_VIRTUAL_FRAGMENT');

// SVG 命名空间
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
// 支持的 SVG 标签集合
const SVG_TAGS = new Set(
  (
    'svg,path,circle,rect,ellipse,line,polygon,polyline,' +
    'text,tspan,textPath,' +
    'g,defs,symbol,use,marker,' +
    'linearGradient,radialGradient,pattern,stop,' +
    'image,foreignObject,' +
    'clipPath,mask,marker,' +
    'animate,animateMotion,animateTransform,' +
    'filter,feGaussianBlur,feColorMatrix,feComposite,' +
    'a,view,' +
    'radialGradient,mesh,hatch,' +
    'mask,filter,feDropShadow'
  ).split(','),
);

/**
 * JSX 元素创建函数
 */
function jsx(type, props) {
  const { ref, className, style, children, ...attrs } = props;

  // 如果 type 为组件函数，则直接调用并传入 props（包括 children）
  if (typeof type === 'function') {
    return type(props);
  }

  // 创建 DOM 元素
  const element =
    type === FRAGMENT_TYPE
      ? document.createDocumentFragment()
      : createElement(type, { className, style });

  // 非 Fragment 元素：设置属性及 ref 回调
  if (type !== FRAGMENT_TYPE) {
    applyAttributes(element, attrs);
    if (ref) ref(element);
  }

  // 处理子节点（支持数组、嵌套 Fragment、文本）
  if (children != null) {
    appendChildren(element, children);
  }

  return element;
}

/**
 * 创建基础 DOM 元素
 */
function createElement(tagName, { className, style }) {
  const element = SVG_TAGS.has(tagName)
    ? document.createElementNS(SVG_NAMESPACE, tagName)
    : document.createElement(tagName);

  if (__DEV__) {
    // 设置内部标记属性，用以识别 JSX 创建的元素
    element.setAttribute('__oe_dev_jsx', '');
  }

  if (className) element.className = className;
  if (style) Object.assign(element.style, style);

  return element;
}

/**
 * 设置元素属性及事件监听
 */
function applyAttributes(element, attrs) {
  for (const [prop, value] of Object.entries(attrs)) {
    if (value == null) continue;

    // 如果属性以 "on" 开头，则认为是事件监听（例如 onClick -> click）
    if (/^on[A-Z]/.test(prop)) {
      const eventType = prop.slice(2).toLowerCase();
      on(eventType, value, { target: element });
    } else {
      element.setAttribute(prop, value);
    }
  }
}

/**
 * 递归追加子节点到指定父节点
 */
function appendChildren(parent, childNodes) {
  // 检查 childNodes 是否为数组
  if (Array.isArray(childNodes)) {
    // 如果是数组，遍历数组中的每个子节点并递归调用 appendChildren 函数
    childNodes.forEach((childNode) => appendChildren(parent, childNode));
  } else if (childNodes instanceof Element || childNodes instanceof DocumentFragment) {
    // 如果 childNodes 是一个 HTML 元素或文档片段，直接将其追加到父节点
    parent.appendChild(childNodes);
  } else if (childNodes != null && childNodes !== false) {
    // 如果 childNodes 不是 null 也不是 false，将其转换为文本节点并追加到父节点
    parent.appendChild(document.createTextNode(childNodes));
  }
}

// 导出接口
export { jsx, jsx as jsxs, FRAGMENT_TYPE as Fragment };
