import { on } from '../src/event';

// 虚拟节点类型常量（用于 Fragment 表示）
const FRAGMENT_TYPE = 'INTERNAL_VIRTUAL_FRAGMENT';
// DOM 元素标记属性
const JSX_MARK = '__oe_jsx';

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
  const element = createElement(type, { className, style });

  // 非 Fragment 元素：设置属性及 ref 回调
  if (type !== FRAGMENT_TYPE) {
    applyAttributes(element, attrs);
    if (ref) ref(element);
  }

  // 处理子节点（支持数组、嵌套 Fragment、文本）
  if (children != null) {
    appendChildren(element, Array.isArray(children) ? children : [children]);
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

  // 设置内部标记属性，用以识别 JSX 创建的元素
  element.setAttribute(JSX_MARK, '');

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
function appendChildren(parent, children) {
  for (const child of children) {
    if (!child) continue;
    if (child.tagName === FRAGMENT_TYPE) {
      // 如果是 Fragment，递归处理其内部子节点
      appendChildren(parent, Array.from(child.children));
    } else if (child instanceof Element) {
      parent.appendChild(child);
    } else if (Array.isArray(child)) {
      appendChildren(parent, child);
    } else {
      // 其它值转换为文本节点
      const text = document.createTextNode(child);
      parent.appendChild(text);
    }
  }
}

// 导出接口
export { jsx, jsx as jsxs, FRAGMENT_TYPE as Fragment };
