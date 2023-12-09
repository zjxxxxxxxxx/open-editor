import { type RectBox } from '../utils/getRectBoxs';
import {
  getDOMRect,
  getHtml,
  host,
  CSS_util,
  applyStyle,
  jsx,
  addClass,
  removeClass,
} from '../utils/html';
import { SafeAreaObserver } from '../utils/SafeAreaObserver';
import { InternalElements } from '../constants';
import { type SourceCode, resolveSource } from '../resolve';

export interface HTMLTooltipElement extends HTMLElement {
  open(): void;
  close(): void;
  update(activeEl?: HTMLElement, style?: RectBox): void;
}

const CSS = postcss`
.oe-root {
  position: fixed;
  z-index: var(--z-index-tooltip);
  padding: 6px 8px;
  display: none;
  padding: 12px 20px;
  max-width: calc(100% - 56px);
  color: var(--text);
  visibility: hidden;
  background: var(--fill-opt);
  backdrop-filter: blur(20px);
  box-shadow: 0 0 1px var(--fill-2);
  border-radius: 12px;
  pointer-events: none;
  will-change: visibility, top, left;
}
.oe-comp {
  font-size: 14px;
  font-weight: 500;
}
.oe-file {
  color: var(--text-2);
  text-decoration: underline;
  word-wrap: break-word;
}
.oe-show {
  display: inline-block;
  visibility: hidden;
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
            className: 'oe-root',
          },
          jsx('span', {
            ref: (el) => (this.el = el),
          }),
          jsx('span', {
            ref: (el) => (this.comp = el),
            className: 'oe-comp',
          }),
          jsx('div', {
            ref: (el) => (this.file = el),
            className: 'oe-file',
          }),
        ),
      });
    }

    open = () => {
      addClass(this.root, 'oe-show');
    };

    close = () => {
      removeClass(this.root, 'oe-show');
    };

    update = (activeEl?: HTMLElement, box?: RectBox) => {
      // before hidden
      applyStyle(this.root, {
        visibility: 'hidden',
        top: CSS_util.px(offset),
        left: CSS_util.px(offset),
      });

      if (!activeEl) return;

      const source = resolveSource(activeEl);
      if (source.meta) {
        this.updateText(source);
        this.updatePosition(box!);

        // after visible
        applyStyle(this.root, {
          visibility: 'visible',
        });
      }
    };

    private updateText(source: SourceCode) {
      const { el, meta } = source;
      this.el.innerText = `${el} in `;
      this.comp.innerText = `<${meta!.name}>`;
      this.file.innerText = `${meta!.file}:${meta!.line}:${meta!.column}`;
    }

    private updatePosition(box: RectBox) {
      const {
        // window width excluding the scrollbar width
        clientWidth: winW,
        // window height excluding the scrollbar height
        clientHeight: winH,
      } = getHtml();
      const { width: rootW, height: rootH } = getDOMRect(this.root);
      const safe = SafeAreaObserver.value;

      const curTop =
        box.top > rootH + offset * 2 + safe.top
          ? // on top
            box.top - rootH - offset
          : // on bottom
            box.bottom + offset;
      const posTop = clamp(
        curTop,
        offset + safe.top,
        winH - rootH - offset - safe.bottom,
      );

      const posLeft = clamp(
        box.left,
        offset + safe.left,
        winW - rootW - offset - safe.right,
      );

      applyStyle(this.root, {
        top: CSS_util.px(posTop),
        left: CSS_util.px(posLeft),
      });
    }
  }

  function clamp(cur: number, start: number, end: number) {
    return Math.min(Math.max(cur, start), end);
  }

  customElements.define(InternalElements.HTML_TOOLTIP_ELEMENT, TooltipElement);
}
