import type { RectStyle } from '../utils/getRectStyles';
import {
  getDOMRect,
  getHtml,
  host,
  CSS_util,
  applyStyle,
  jsx,
} from '../utils/html';
import { getSafeArea } from '../utils/getSafeArea';
import { InternalElements } from '../constants';
import { resolveSource } from '../resolve';

export interface HTMLTooltipElement extends HTMLElement {
  open(): void;
  close(): void;
  update(activeElement?: HTMLElement, style?: RectStyle): void;
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
  box-shadow: 0 0 1px var(--fill-3);
  border-radius: 12px;
  pointer-events: none;
  will-change: visibility, top, left;
}
.element {
  font-size: 12px;
}
.component {
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
    private element!: HTMLElement;
    private component!: HTMLElement;
    private file!: HTMLElement;

    constructor() {
      super();

      host({
        root: this,
        style: CSS,
        element: jsx(
          'div',
          {
            ref: (el) => (this.root = el),
            className: 'root',
          },
          jsx('span', {
            ref: (el) => (this.element = el),
            className: 'element',
          }),
          jsx('span', {
            ref: (el) => (this.component = el),
            className: 'component',
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

    update = (activeElement?: HTMLElement, style?: RectStyle) => {
      // before hidden
      applyStyle(this.root, {
        visibility: 'hidden',
        top: CSS_util.px(offset),
        left: CSS_util.px(offset),
      });

      if (activeElement && style) {
        const { element, meta } = resolveSource(activeElement);
        if (meta) {
          this.element.innerText = `${element} in `;
          this.component.innerText = `<${meta.name}>`;
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
      const { top, right, bottom, left } = getSafeArea();
      const positionStyle: Partial<CSSStyleDeclaration> = {};

      // on top
      if (style.top > rootH + offset * 2 + top) {
        positionStyle.top = CSS_util.px(style.top - rootH - offset);
      }
      // on bottom
      else {
        const maxTop = winH - rootH - offset - bottom;
        positionStyle.top = CSS_util.px(
          Math.min(style.bottom + offset, maxTop),
        );
      }

      const minLeft = offset + left;
      const maxLeft = winW - rootW - offset - right;
      positionStyle.left = CSS_util.px(
        Math.max(Math.min(style.left, maxLeft), minLeft),
      );

      applyStyle(this.root, positionStyle);
    }
  }

  customElements.define(InternalElements.HTML_TOOLTIP_ELEMENT, TooltipElement);
}
