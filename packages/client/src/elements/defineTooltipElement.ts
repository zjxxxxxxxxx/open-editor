import { type RectStyle } from '../utils/getRectStyles';
import {
  getDOMRect,
  getHtml,
  host,
  CSS_util,
  applyStyle,
  jsx,
} from '../utils/html';
import { SafeAreaObserver } from '../utils/SafeAreaObserver';
import { InternalElements } from '../constants';
import { resolveSource } from '../resolve';

export interface HTMLTooltipElement extends HTMLElement {
  open(): void;
  close(): void;
  update(activeEl?: HTMLElement, style?: RectStyle): void;
}

const CSS = postcss`
.root {
  position: fixed;
  z-index: var(--z-index-tooltip);
  padding: 6px 8px;
  display: none;
  padding: 12px 20px;
  max-width: calc(100% - 56px);
  color: var(--text);
  visibility: hidden;
  background: var(--fill);
  backdrop-filter: blur(16px);
  box-shadow: 0 0 1px var(--fill-2);
  border-radius: 12px;
  pointer-events: none;
  will-change: visibility, top, left;
}
.el {
  font-size: 12px;
}
.comp {
  font-size: 14px;
  font-weight: 500;
}
.file {
  font-size: 12px;
  color: var(--text-2);
  text-decoration: underline;
  word-wrap: break-word;
}
`;

export function defineTooltipElement() {
  const offset = 6;

  class TooltipElement extends HTMLElement implements HTMLTooltipElement {
    private root!: HTMLElement;
    private el!: HTMLElement;
    private comp!: HTMLElement;
    private file!: HTMLElement;

    constructor() {
      super();

      host(this, {
        css: CSS,
        html: jsx(
          'div',
          {
            ref: (el) => (this.root = el),
            className: 'root',
          },
          jsx('span', {
            ref: (el) => (this.el = el),
            className: 'el',
          }),
          jsx('span', {
            ref: (el) => (this.comp = el),
            className: 'comp',
          }),
          jsx('div', {
            ref: (el) => (this.file = el),
            className: 'file',
          }),
        ),
      });
    }

    open = () => {
      applyStyle(this.root, {
        display: 'inline-block',
        visibility: 'hidden',
      });
    };

    close = () => {
      applyStyle(this.root, {
        display: 'none',
      });
    };

    update = (activeEl?: HTMLElement, style?: RectStyle) => {
      // before hidden
      applyStyle(this.root, {
        visibility: 'hidden',
        top: CSS_util.px(offset),
        left: CSS_util.px(offset),
      });

      if (activeEl && style) {
        const { el, meta } = resolveSource(activeEl);
        if (meta) {
          this.el.innerText = `${el} in `;
          this.comp.innerText = `<${meta.name}>`;
          this.file.innerText = `${meta.file}:${meta.line}:${meta.column}`;

          this.updatePosStyle(style);
          // after visible
          applyStyle(this.root, {
            visibility: 'visible',
          });
        }
      }
    };

    private updatePosStyle(style: RectStyle) {
      const {
        // window width excluding the scrollbar width
        clientWidth: winW,
        // window height excluding the scrollbar height
        clientHeight: winH,
      } = getHtml();
      const { width: rootW, height: rootH } = getDOMRect(this.root);
      const { top, right, bottom, left } = SafeAreaObserver.value;

      const posStyle: Partial<CSSStyleDeclaration> = {};
      // on top
      if (style.top > rootH + offset * 2 + top) {
        posStyle.top = CSS_util.px(style.top - rootH - offset);
      }
      // on bottom
      else {
        const maxTop = winH - rootH - offset - bottom;
        posStyle.top = CSS_util.px(Math.min(style.bottom + offset, maxTop));
      }

      const minLeft = offset + left;
      const maxLeft = winW - rootW - offset - right;
      posStyle.left = CSS_util.px(
        Math.max(Math.min(style.left, maxLeft), minLeft),
      );

      applyStyle(this.root, posStyle);
    }
  }

  customElements.define(InternalElements.HTML_TOOLTIP_ELEMENT, TooltipElement);
}
