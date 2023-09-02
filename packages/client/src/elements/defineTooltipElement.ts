import type { ComputedStyle } from '../utils/getComputedStyles';
import {
  applyStyle,
  CSS_util,
  create,
  append,
  getRect,
} from '../utils/document';
import { Colors, InternalElements } from '../constants';
import { resolveSource } from '../resolve';

export interface HTMLTooltipElement extends HTMLElement {
  open(): void;
  close(): void;
  update(activeElement?: HTMLElement, style?: ComputedStyle): void;
}

const css = `
.container {
  position: fixed;
  z-index: 1000002;
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
    #container: HTMLElement;
    #element: HTMLElement;
    #component: HTMLElement;
    #file: HTMLElement;

    #offset = 6;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      shadow.innerHTML = `<style>${css}</style>`;

      this.#container = create('div');
      this.#container.classList.add('container');

      this.#element = create('span');
      this.#element.classList.add('element');

      this.#component = create('span');
      this.#component.classList.add('component');

      this.#file = create('div');
      this.#file.classList.add('file');

      append(this.#container, this.#element);
      append(this.#container, this.#component);
      append(this.#container, this.#file);
      append(shadow, this.#container);
    }

    public open = () => {
      applyStyle(this.#container, {
        display: 'inline-block',
        visibility: 'hidden',
      });
    };

    public close = () => {
      applyStyle(this.#container, {
        display: 'none',
      });
    };

    public update = (activeElement?: HTMLElement, style?: ComputedStyle) => {
      // before hidden
      applyStyle(this.#container, {
        visibility: 'hidden',
        top: CSS_util.px(this.#offset),
        left: CSS_util.px(this.#offset),
      });

      if (activeElement && style) {
        this.#updateText(activeElement);
        this.#updatePosition(style);
        // after visible
        applyStyle(this.#container, {
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
        applyStyle(this.#container, {
          borderColor: Colors.TOOLTIP_BORDER_COLOR,
        });
        applyStyle(this.#component, {
          color: Colors.TOOLTIP_COMPONENT_COLOR,
        });
        applyStyle(this.#file, {
          color: Colors.TOOLTIP_FILE_COLOR,
        });
      } else {
        applyStyle(this.#container, {
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

    #updatePosition(style: ComputedStyle) {
      const {
        // window width excluding the scrollbar width
        clientWidth: windowWidth,
        // window height excluding the scrollbar height
        clientHeight: windowHeight,
      } = document.documentElement;
      const { width: containerWidth, height: containerHeight } = getRect(
        this.#container,
      );

      // on top
      if (style.top > containerHeight + this.#offset) {
        applyStyle(this.#container, {
          top: CSS_util.px(style.top - containerHeight - this.#offset),
        });
      }
      // on bottom
      else {
        const maxTop = windowHeight - containerHeight - this.#offset;
        applyStyle(this.#container, {
          top: CSS_util.px(Math.min(style.bottom + this.#offset, maxTop)),
        });
      }

      const minLeft = this.#offset;
      const maxLeft = windowWidth - containerWidth - this.#offset;
      applyStyle(this.#container, {
        left: CSS_util.px(Math.max(Math.min(style.left, maxLeft), minLeft)),
      });
    }
  }

  customElements.define(InternalElements.HTML_TOOLTIP_ELEMENT, TooltipElement);
}
