import { on } from '../src/utils/event';

const FRAGMENT_TYPE = 'INTERNAL_VIRTUAL_FRAGMENT';

const svgNS = 'http://www.w3.org/2000/svg';
const svgTypes = {
  svg: true,
  path: true,
};

function jsx(type, props) {
  const { ref, className, style, children, ...attrs } = props;

  const el = svgTypes[type]
    ? document.createElementNS(svgNS, type)
    : document.createElement(type);

  if (children != null) {
    appendChildren(el, toArray(children));
  }

  if (type !== FRAGMENT_TYPE) {
    if (className) el.className = className;
    if (style) Object.assign(el.style, style);
    for (const prop of Object.keys(attrs)) {
      const val = attrs[prop];
      if (val != null) {
        if (isEventType(prop)) {
          on(toNativeType(prop), val, { target: el });
        } else {
          el.setAttribute(prop, val);
        }
      }
    }
    if (ref) ref(el);
  }

  return el;
}

const toArray = [].concat.bind([]);

const eventRE = /^on[A-Z]/;
function isEventType(val) {
  return eventRE.test(val);
}

function toNativeType(val) {
  return val.substr(2).toLowerCase();
}

function appendChildren(el, children) {
  for (const child of children) {
    if (!child) continue;
    if (child instanceof Element) {
      if (child.tagName === FRAGMENT_TYPE) {
        appendChildren(el, Array.from(child.children));
      } else {
        el.appendChild(child);
      }
    } else if (Array.isArray(child)) {
      appendChildren(el, child);
    } else {
      el.appendChild(document.createTextNode(child));
    }
  }
}

export { jsx, jsx as jsxs, FRAGMENT_TYPE as Fragment };
