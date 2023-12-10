const Fragment = '__FRAGMENT__';

const svgTag = ['svg', 'path'];

function jsx(type, props, ...children) {
  const { ref, className, style, children: _children, ...attrs } = props;
  if (typeof _children !== 'undefined') {
    children = children.concat(_children);
  }

  const el = svgTag.includes(type)
    ? document.createElementNS('http://www.w3.org/2000/svg', type)
    : document.createElement(type);

  appendChildren(el, children);

  if (type !== Fragment) {
    if (className) {
      el.classList.add(...className.split(' '));
    }
    if (style) {
      Object.assign(el.style, style);
    }
    for (const property of Object.keys(attrs)) {
      const attr = attrs[property];
      if (attr != null) {
        el.setAttribute(property, String(attr));
      }
    }
    ref?.(el);
  }

  return el;
}

function appendChildren(el, children) {
  for (const child of children) {
    if (Array.isArray(child)) {
      appendChildren(el, child);
    } else if (typeof child === 'string' || typeof child === 'number') {
      el.append(document.createTextNode(child));
    } else if (child instanceof Element) {
      if (child.tagName === Fragment) {
        appendChildren(el, Array.from(child.children));
      } else {
        el.append(child);
      }
    } else {
      el.append(child);
    }
  }
}

export { jsx, jsx as jsxs, Fragment };
