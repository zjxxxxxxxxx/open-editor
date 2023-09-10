import type { ComputedStyle } from '../utils/getComputedStyles';
import {
  applyStyle,
  CSS_util,
  create,
  append,
  getDOMRect,
} from '../utils/document';
import { Colors, InternalElements } from '../constants';
import { resolveSource } from '../resolve';

export interface HTMLTooltipElement extends HTMLElement {
  open(): void;
  close(): void;
  update(activeElement?: HTMLElement, style?: ComputedStyle): void;
}

const CSS = `
.root {
  position: fixed;
  z-index: var(--z-index-tooltip);
  padding: 10px 20px;
  display: none;
  max-width: calc(100% - 56px);
  visibility: hidden;
  background: var(--bg-color);
  border-radius: 4px;
  border: 2px solid transparent;
  pointer-events: none;
}
.element {
  color: var(--element);
  font-size: 14px;
}
.component {
  font-size: 16px;
  font-weight: 500;
}
.file {
  font-size: 14px;
  font-weight: 200;
  text-decoration: underline;
  word-wrap: break-word;
}
`;

export function defineTooltipElement() {
  class TooltipElement extends HTMLElement implements HTMLTooltipElement {
    #root: HTMLElement;
    #element: HTMLElement;
    #component: HTMLElement;
    #file: HTMLElement;

    #offset = 6;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      shadow.innerHTML = `<style>${CSS}</style>`;

      this.#root = create('div');
      this.#root.classList.add('root');

      this.#element = create('span');
      this.#element.classList.add('element');

      this.#component = create('span');
      this.#component.classList.add('component');

      this.#file = create('div');
      this.#file.classList.add('file');

      append(this.#root, this.#element);
      append(this.#root, this.#component);
      append(this.#root, this.#file);
      append(shadow, this.#root);
    }

    public open = () => {
      applyStyle(this.#root, {
        display: 'inline-block',
        visibility: 'hidden',
      });
    };

    public close = () => {
      applyStyle(this.#root, {
        display: 'none',
      });
    };

    public update = (activeElement?: HTMLElement, style?: ComputedStyle) => {
      // before hidden
      applyStyle(this.#root, {
        visibility: 'hidden',
        top: CSS_util.px(this.#offset),
        left: CSS_util.px(this.#offset),
      });

      if (activeElement && style) {
        this.#updateText(activeElement);
        this.#updatePositionStyle(style);
        // after visible
        applyStyle(this.#root, {
          visibility: 'visible',
        });
      }
    };

    #updateText(activeElement: HTMLElement) {
      const { element, meta } = resolveSource(activeElement);

      this.#element.innerText = `${element} in `;
      this.#component.innerText = `<${meta?.name ?? 'Unknown'}>`;
      this.#file.innerText = meta?.file ?? 'filename not found 😭.';

      if (meta) {
        applyStyle(this.#root, {
          borderColor: Colors.TOOLTIP_BORDER_COLOR,
        });
        applyStyle(this.#component, {
          color: Colors.TOOLTIP_COMPONENT_COLOR,
        });
        applyStyle(this.#file, {
          color: Colors.TOOLTIP_FILE_COLOR,
        });
      } else {
        applyStyle(this.#root, {
          borderColor: Colors.ERROR,
        });
        applyStyle(this.#component, {
          color: Colors.ERROR,
        });
        applyStyle(this.#file, {
          color: Colors.ERROR,
        });
      }
    }

    #updatePositionStyle(style: ComputedStyle) {
      const {
        // window width excluding the scrollbar width
        clientWidth: winW,
        // window height excluding the scrollbar height
        clientHeight: winH,
      } = document.documentElement;
      const { width: rootW, height: rootH } = getDOMRect(this.#root);
      const positionStyle: Partial<CSSStyleDeclaration> = {};

      // on top
      if (style.top > rootH + this.#offset * 2) {
        positionStyle.top = CSS_util.px(style.top - rootH - this.#offset);
      }
      // on bottom
      else {
        const maxTop = winH - rootH - this.#offset;
        positionStyle.top = CSS_util.px(
          Math.min(style.bottom + this.#offset, maxTop),
        );
      }

      const minLeft = this.#offset;
      const maxLeft = winW - rootW - this.#offset;
      positionStyle.left = CSS_util.px(
        Math.max(Math.min(style.left, maxLeft), minLeft),
      );

      applyStyle(this.#root, positionStyle);
    }
  }

  customElements.define(InternalElements.HTML_TOOLTIP_ELEMENT, TooltipElement);
}
